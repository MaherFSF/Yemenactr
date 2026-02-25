# Sector AI Agents Architecture

## Overview

Intelligent AI agents for each economic sector that provide real-time analysis, answer questions, and provide evidence-backed insights using knowledge bases and live data connections.

## Architecture Components

### 1. Knowledge Base System

Each sector has a comprehensive knowledge base containing:
- Historical economic data (2010-present)
- Policy documents and regulations
- Research papers and reports
- News articles and events
- Expert analysis and commentary
- International comparisons

### 2. Data Integration Layer

**Real-time Data Sources**:
- World Bank API
- IMF Data API
- UN OCHA ReliefWeb
- Central Bank of Yemen (CBY)
- Local market data
- Trade statistics

**Database Connection**:
- MySQL/TiDB for persistent storage
- Drizzle ORM for type-safe queries
- Real-time data synchronization
- Historical data archiving

### 3. AI Agent Components

**Conversation Engine**:
- Context-aware responses
- Multi-turn conversations
- Source attribution
- Confidence scoring
- Evidence-backed answers

**Knowledge Retrieval**:
- Vector embeddings for semantic search
- Hybrid search (keyword + semantic)
- Relevance ranking
- Citation generation

**Data Analysis**:
- Trend analysis
- Comparative analysis
- Forecasting (ML-based)
- Anomaly detection

## Sector Agents

### Banking & Finance Sector Agent
- **Focus**: Central bank policies, exchange rates, financial stability
- **Data Sources**: CBY, World Bank, IMF
- **Key Metrics**: Interest rates, reserve requirements, credit growth
- **Capabilities**: Policy analysis, rate forecasting, stability assessment

### Trade & Commerce Sector Agent
- **Focus**: Import/export flows, trade agreements, market dynamics
- **Data Sources**: UN Comtrade, World Bank, Local customs
- **Key Metrics**: Trade volume, commodity prices, tariffs
- **Capabilities**: Trade flow analysis, market trends, opportunity identification

## Implementation Details

### Backend (tRPC Procedures)

```typescript
// Sector AI Agent Router
sector.bankingAgent.chat.mutation() // Send message to banking agent
sector.tradeAgent.chat.mutation() // Send message to trade agent
sector.agent.getKnowledgeBase.query() // Retrieve knowledge base
sector.agent.getSources.query() // Get data sources for sector
```

### Frontend (React Components)

```typescript
// Sector AI Chat Interface
<SectorAIChatBox sectorId="banking" />
<SectorAIChatBox sectorId="trade" />

// Features:
// - Real-time streaming responses
// - Source citations
// - Confidence indicators
// - Export conversation
// - Save insights
```

### Database Schema

```sql
-- Sector Knowledge Base
CREATE TABLE sector_knowledge_base (
  id INT PRIMARY KEY,
  sector_id VARCHAR(50),
  content_type VARCHAR(50), -- 'policy', 'research', 'news', etc.
  title VARCHAR(255),
  content LONGTEXT,
  source_url VARCHAR(500),
  published_date DATETIME,
  embedding VECTOR(1536), -- For semantic search
  created_at DATETIME
);

-- Conversation History
CREATE TABLE sector_agent_conversations (
  id INT PRIMARY KEY,
  user_id INT,
  sector_id VARCHAR(50),
  messages JSON,
  created_at DATETIME,
  updated_at DATETIME
);

-- Data Sources
CREATE TABLE sector_data_sources (
  id INT PRIMARY KEY,
  sector_id VARCHAR(50),
  source_name VARCHAR(100),
  api_endpoint VARCHAR(500),
  last_updated DATETIME,
  status VARCHAR(20), -- 'active', 'inactive', 'error'
  error_message TEXT
);
```

## API Connections & Status

### World Bank API
- **Endpoint**: https://api.worldbank.org/v2/
- **Status**: ✅ Active
- **Rate Limit**: 120 requests/minute
- **Data**: GDP, inflation, trade indicators

### IMF Data API
- **Endpoint**: https://www.imfconnect.imf.org/
- **Status**: ✅ Active
- **Rate Limit**: Varies by dataset
- **Data**: Macroeconomic indicators, financial statistics

### UN OCHA ReliefWeb
- **Endpoint**: https://reliefweb.int/api/
- **Status**: ⚠️ Requires API key (currently missing)
- **Rate Limit**: 100 requests/minute
- **Data**: Humanitarian funding, crisis data

### Central Bank of Yemen (CBY)
- **Endpoint**: Internal data feed
- **Status**: ⚠️ Manual data import required
- **Frequency**: Weekly updates
- **Data**: Exchange rates, monetary policy, reserves

## Database Connection Setup

### Local Development

```bash
# Set DATABASE_URL in .env
DATABASE_URL="mysql://user:password@localhost:3306/yeto_dev"

# Run migrations
pnpm db:push

# Seed knowledge base
pnpm db:seed:sectors
```

### Production

```bash
# Use managed database (TiDB/MySQL)
DATABASE_URL="mysql://user:password@prod-db-host:3306/yeto_prod"

# Automatic migrations on deploy
# Knowledge base synced daily
```

## Known Issues & Fixes Required

### 1. ReliefWeb API Connection
**Issue**: 403 Forbidden error when accessing ReliefWeb API
**Root Cause**: Missing or expired API key
**Fix Required**:
```bash
# Obtain API key from ReliefWeb
# Add to .env: RELIEFWEB_API_KEY=your_key_here
# Update server/connectors/reliefweb.ts with new key
# Test: pnpm test:reliefweb-connector
```

### 2. CBY Data Feed
**Issue**: No automated connection to Central Bank of Yemen
**Root Cause**: CBY doesn't expose public API
**Fix Required**:
```bash
# Manual data import process:
1. Download CSV from CBY website
2. Place in /data/imports/cby-data.csv
3. Run: pnpm db:import:cby
4. Verify data in database
```

### 3. Database Connection Pooling
**Issue**: Connection timeouts under high load
**Root Cause**: Default pool size too small
**Fix Required**:
```typescript
// server/_core/db.ts
const pool = mysql.createPool({
  connectionLimit: 20, // Increase from 10
  waitForConnections: true,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelayMs: 0,
});
```

### 4. Vector Embeddings Storage
**Issue**: No vector database for semantic search
**Root Cause**: MySQL doesn't have native vector support
**Fix Required**:
```bash
# Option 1: Use Pinecone (recommended)
npm install @pinecone-database/pinecone
# Add PINECONE_API_KEY to .env

# Option 2: Use Milvus (self-hosted)
# Deploy Milvus container
# Update connection string in server config
```

## Performance Considerations

### Caching Strategy
- Cache knowledge base embeddings (24-hour TTL)
- Cache API responses (1-hour TTL)
- Cache conversation context (session-based)

### Rate Limiting
- 100 requests/minute per user
- 1000 requests/minute per sector
- Burst allowance: 50 requests/10 seconds

### Scalability
- Horizontal scaling: Multiple agent instances
- Load balancing: Round-robin across agents
- Queue system: For long-running analysis tasks

## Testing

### Unit Tests
```bash
pnpm test:sector-agents
```

### Integration Tests
```bash
pnpm test:sector-agents:integration
```

### Load Tests
```bash
pnpm test:sector-agents:load
```

## Deployment Checklist

- [ ] All API keys configured in production
- [ ] Database migrations applied
- [ ] Knowledge base seeded
- [ ] Vector embeddings generated
- [ ] API connections tested
- [ ] Rate limiting configured
- [ ] Monitoring alerts set up
- [ ] Backup strategy implemented
- [ ] Documentation updated
- [ ] User testing completed
