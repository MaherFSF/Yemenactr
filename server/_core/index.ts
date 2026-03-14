import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { initializeSchedulerJobs, runDueJobs } from "../services/dailyScheduler";
import { initializeScheduler } from "../init-scheduler";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);
  // SSE streaming endpoint for AI agent chat
  app.post('/api/agent-stream', async (req, res) => {
    try {
      const { sectorId, message, conversationHistory, agentPersona, language } = req.body;
      if (!sectorId || !message) {
        res.status(400).json({ error: 'sectorId and message are required' });
        return;
      }

      // Set SSE headers
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.setHeader('X-Accel-Buffering', 'no');
      res.flushHeaders();

      const { AGENT_PERSONAS } = await import('../ai/agentPersonas');
      const { getSectorDataContext } = await import('../services/sectorDataService');
      const { ENV } = await import('./env');

      const persona = AGENT_PERSONAS[agentPersona || 'citizen_explainer'];
      const sectorData = await getSectorDataContext(sectorId);
      let dataContext = '';
      const sourcesUsed: Array<{ title: string; url: string; type: string; confidence: string }> = [];

      if (sectorData && sectorData.indicators.length > 0) {
        dataContext = `\n\n=== REAL YEMEN ECONOMIC DATA (from YETO Database) ===\n`;
        dataContext += `Sector: ${sectorData.sectorName}\nTotal data points: ${sectorData.dataPoints}\n`;
        dataContext += `Data range: ${sectorData.dateRange.from} to ${sectorData.dateRange.to}\n\n`;
        for (const ind of sectorData.indicators) {
          if (ind.latestValue !== null) {
            dataContext += `${ind.name}: ${ind.latestValue.toLocaleString()} ${ind.unit} (${ind.latestDate})`;
            if (ind.changePercent !== null) dataContext += ` [${ind.changePercent > 0 ? '+' : ''}${ind.changePercent}%]`;
            if (ind.historicalData.length > 0) {
              const recent = ind.historicalData.slice(-5);
              dataContext += `\n  History: ${recent.map(h => `${h.year}:${h.value.toLocaleString()}`).join(', ')}`;
            }
            dataContext += '\n';
            sourcesUsed.push({ title: `${ind.name} - YETO Database`, url: 'https://data.worldbank.org/indicator?locations=YE', type: 'data', confidence: 'high' });
          }
        }
        dataContext += `=== END OF REAL DATA ===\n`;
      }

      const systemPrompt = `You are an expert AI assistant for YETO (Yemen Economic Transparency Observatory).\n${persona?.systemPromptAddition || ''}\nContext: Sector: ${sectorId}, Language: ${language === 'ar' ? 'Arabic' : 'English'}\n${dataContext}\nCRITICAL: Use the REAL DATA above. Cite sources. Be transparent about confidence. Respond in ${language === 'ar' ? 'Arabic' : 'English'}.`;

      const messages: any[] = [{ role: 'system', content: systemPrompt }];
      if (conversationHistory?.length > 0) messages.push(...conversationHistory.slice(-10));
      messages.push({ role: 'user', content: message });

      const apiUrl = ENV.forgeApiUrl ? `${ENV.forgeApiUrl.replace(/\/$/, '')}/v1/chat/completions` : 'https://forge.manus.im/v1/chat/completions';

      const llmResponse = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'content-type': 'application/json', authorization: `Bearer ${ENV.forgeApiKey}` },
        body: JSON.stringify({ model: 'gemini-2.5-flash', messages, max_tokens: 32768, stream: true }),
      });

      if (!llmResponse.ok || !llmResponse.body) {
        res.write(`data: ${JSON.stringify({ type: 'error', content: 'LLM request failed' })}\n\n`);
        res.end();
        return;
      }

      // Send metadata first
      const confidence = sectorData && sectorData.dataPoints > 50 ? 'high' : sectorData && sectorData.dataPoints > 10 ? 'medium' : 'low';
      res.write(`data: ${JSON.stringify({ type: 'meta', confidence, sources: sourcesUsed.slice(0, 5) })}\n\n`);

      // Stream the LLM response
      const reader = llmResponse.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim();
            if (data === '[DONE]') {
              res.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`);
              continue;
            }
            try {
              const parsed = JSON.parse(data);
              const delta = parsed.choices?.[0]?.delta?.content;
              if (delta) {
                res.write(`data: ${JSON.stringify({ type: 'token', content: delta })}\n\n`);
              }
            } catch (e) { /* skip malformed chunks */ }
          }
        }
      }

      res.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`);
      res.end();
    } catch (error: any) {
      console.error('[Agent Stream] Error:', error);
      try {
        res.write(`data: ${JSON.stringify({ type: 'error', content: error.message || 'Unknown error' })}\n\n`);
        res.end();
      } catch (e) { /* response already ended */ }
    }
  });

  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, async () => {
    console.log(`Server running on http://localhost:${port}/`);
    
    // Initialize scheduler jobs in database
    await initializeSchedulerJobs();
    
    // Initialize YETO ingestion scheduler
    try {
      await initializeScheduler();
    } catch (error) {
      console.error('[YETO Scheduler] Failed to initialize:', error);
    }
    
    // Check for due jobs every 5 minutes
    setInterval(async () => {
      try {
        await runDueJobs();
      } catch (error) {
        console.error('[Scheduler] Error running due jobs:', error);
      }
    }, 5 * 60 * 1000); // 5 minutes
    
    console.log('[Scheduler] Automated data refresh enabled');
  });
}

startServer().catch(console.error);
