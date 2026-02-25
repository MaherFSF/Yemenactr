/**
 * Sector Routers - tRPC procedures for sector-specific operations
 * Including AI agent chat, data retrieval, and analysis
 */

import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { invokeLLM } from "../_core/llm";
import { AGENT_PERSONAS } from "../ai/agentPersonas";

// ============================================================================
// TYPES
// ============================================================================

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface AgentChatResponse {
  content: string;
  sources?: Array<{
    title: string;
    url: string;
    type: "research" | "data" | "news" | "policy";
    confidence: "high" | "medium" | "low";
  }>;
  confidence?: "high" | "medium" | "low";
}

// ============================================================================
// SECTOR ROUTERS
// ============================================================================

export const sectorsRouter = router({
  /**
   * Agent Chat - Interactive conversation with sector-specific AI agents
   * 
   * Supports multiple agent personas:
   * - citizen_explainer: Simple language for general public
   * - policymaker_brief: Executive briefs for decision-makers
   * - donor_accountability: Aid flow and donor tracking
   * - bank_compliance: Banking sector compliance
   * - research_librarian: Document search and citations
   * - data_steward: Data quality and methodology
   * - translation_agent: Arabic-English translation
   * - scenario_modeler: What-if analysis and forecasting
   */
  agentChat: publicProcedure
    .input(
      z.object({
        sectorId: z.string().describe("Sector ID (e.g., 'banking', 'trade')"),
        message: z.string().describe("User message to the agent"),
        conversationHistory: z
          .array(
            z.object({
              role: z.enum(["user", "assistant"]),
              content: z.string(),
            })
          )
          .optional()
          .describe("Previous conversation messages for context"),
        agentPersona: z
          .enum([
            "citizen_explainer",
            "policymaker_brief",
            "donor_accountability",
            "bank_compliance",
            "research_librarian",
            "data_steward",
            "translation_agent",
            "scenario_modeler",
          ])
          .default("citizen_explainer")
          .describe("Agent persona to use"),
        language: z.enum(["en", "ar"]).default("en").describe("Response language"),
      })
    )
    .mutation(async ({ input }): Promise<AgentChatResponse> => {
      try {
        const persona = AGENT_PERSONAS[input.agentPersona];
        if (!persona) {
          throw new Error(`Unknown agent persona: ${input.agentPersona}`);
        }

        // Build system prompt with persona information
        const systemPrompt = `You are an expert AI assistant for the YETO (Yemen Economic Transparency Observatory) platform.

${persona.systemPromptAddition}

Context:
- Sector: ${input.sectorId}
- User Language: ${input.language === "ar" ? "Arabic" : "English"}
- Agent Persona: ${persona.nameEn}

Important Guidelines:
1. Always cite your sources when making claims
2. Be transparent about confidence levels in your analysis
3. If you don't have reliable data, say so clearly
4. For Yemen-specific economic data, use YETO's knowledge base
5. Provide evidence-backed answers with citations
6. Consider both Aden and Sanaa economic dynamics when relevant
7. Be aware of humanitarian and development context`;

        // Build conversation history
        const messages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
          { role: "system", content: systemPrompt },
        ];

        // Add previous conversation
        if (input.conversationHistory && input.conversationHistory.length > 0) {
          messages.push(
            ...input.conversationHistory.map((msg) => ({
              role: msg.role as "user" | "assistant",
              content: msg.content,
            }))
          );
        }

        // Add current message
        messages.push({ role: "user", content: input.message });

        // Call LLM
        const response = await invokeLLM({
          messages: messages as Parameters<typeof invokeLLM>[0]["messages"],
        });

        const assistantContent =
          response.choices[0]?.message?.content || "No response generated";

        // Parse response for sources and confidence
        // In a real implementation, you would extract these from the LLM response
        // or from a knowledge base lookup
        const sources = extractSources(assistantContent, input.sectorId);
        const confidence = assessConfidence(assistantContent);

        return {
          content: assistantContent,
          sources,
          confidence,
        };
      } catch (error) {
        console.error("Agent chat error:", error);
        throw new Error(
          `Failed to get response from ${input.agentPersona} agent: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      }
    }),

  /**
   * Get Sector Knowledge Base - Retrieve knowledge base for a sector
   */
  getKnowledgeBase: publicProcedure
    .input(
      z.object({
        sectorId: z.string(),
        limit: z.number().default(20),
        offset: z.number().default(0),
      })
    )
    .query(async ({ input }) => {
      // In a real implementation, this would query the knowledge base
      // For now, return mock data
      return {
        items: [],
        total: 0,
        limit: input.limit,
        offset: input.offset,
      };
    }),

  /**
   * Get Sector Data Sources - List available data sources for a sector
   */
  getDataSources: publicProcedure
    .input(z.object({ sectorId: z.string() }))
    .query(async ({ input }) => {
      // Map sector IDs to their primary data sources
      const sectorSources: Record<string, string[]> = {
        banking: [
          "Central Bank of Yemen (CBY)",
          "IMF Financial Statistics",
          "World Bank Financial Indicators",
          "Commercial Bank Reports",
        ],
        trade: [
          "UN Comtrade",
          "World Bank Trade Statistics",
          "Port Authorities",
          "Customs Data",
          "Shipping Manifests",
        ],
        macro: [
          "World Bank",
          "IMF",
          "UN OCHA",
          "National Statistics Office",
          "Central Bank",
        ],
        energy: [
          "Power & Energy Company (PEC)",
          "Fuel Importers",
          "Utility Companies",
          "Satellite Imagery",
        ],
        humanitarian: [
          "UN OCHA",
          "WFP",
          "UNHCR",
          "Cluster Reports",
          "Humanitarian Response",
        ],
        labor: [
          "ILO",
          "Central Statistics Office",
          "Private Sector Reports",
          "Labor Ministry",
        ],
      };

      return {
        sectorId: input.sectorId,
        sources: sectorSources[input.sectorId] || [],
        lastUpdated: new Date().toISOString(),
      };
    }),

  /**
   * Get Sector Alerts - Real-time alerts for sector anomalies
   */
  getSectorAlerts: publicProcedure
    .input(
      z.object({
        sectorId: z.string(),
        severity: z.enum(["critical", "high", "medium", "low"]).optional(),
      })
    )
    .query(async ({ input }) => {
      // In a real implementation, this would query the alerts database
      return {
        sectorId: input.sectorId,
        alerts: [],
        lastUpdated: new Date().toISOString(),
      };
    }),
});

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Extract sources from LLM response
 * In a real implementation, this would parse citations and link to knowledge base
 */
function extractSources(
  content: string,
  sectorId: string
): Array<{
  title: string;
  url: string;
  type: "research" | "data" | "news" | "policy";
  confidence: "high" | "medium" | "low";
}> {
  // Simple extraction - in production, use more sophisticated parsing
  const sources: Array<{
    title: string;
    url: string;
    type: "research" | "data" | "news" | "policy";
    confidence: "high" | "medium" | "low";
  }> = [];

  // Look for citations in brackets [source]
  const citationRegex = /\[([^\]]+)\]/g;
  let match;

  while ((match = citationRegex.exec(content)) !== null) {
    const citation = match[1];
    sources.push({
      title: citation,
      url: `https://yeto.causewaygrp.com/research?q=${encodeURIComponent(citation)}`,
      type: "research",
      confidence: "high",
    });
  }

  return sources;
}

/**
 * Assess confidence level of response
 */
function assessConfidence(content: string): "high" | "medium" | "low" {
  // Simple heuristic - in production, use more sophisticated analysis
  const uncertaintyPhrases = [
    "might",
    "could",
    "possibly",
    "unclear",
    "uncertain",
    "insufficient data",
  ];

  const uncertaintyCount = uncertaintyPhrases.filter((phrase) =>
    content.toLowerCase().includes(phrase)
  ).length;

  if (uncertaintyCount > 3) return "low";
  if (uncertaintyCount > 1) return "medium";
  return "high";
}
