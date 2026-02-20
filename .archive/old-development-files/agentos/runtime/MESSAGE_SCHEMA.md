# AgentOS Runtime Message Schema

**Version:** v0.0-control-pack  
**Last Updated:** January 29, 2025

This document defines the message format for inter-agent communication in YETO AgentOS.

---

## Overview

All agents communicate through a standardized message format that ensures:
- Traceability of all communications
- Evidence chain preservation
- Audit logging
- Error handling

---

## Message Structure

```typescript
interface AgentMessage {
  // Message identification
  id: string;                    // UUID v4
  timestamp: string;             // ISO 8601 datetime
  version: string;               // Schema version (1.0.0)
  
  // Routing
  from: AgentIdentifier;
  to: AgentIdentifier;
  replyTo?: string;              // Message ID being replied to
  
  // Content
  type: MessageType;
  payload: MessagePayload;
  
  // Metadata
  context: MessageContext;
  evidence: EvidenceChain;
  
  // Control
  priority: 'high' | 'normal' | 'low';
  ttl: number;                   // Time to live in seconds
  retryCount: number;
}

interface AgentIdentifier {
  agentId: string;               // From AGENTOS_MANIFEST
  instanceId: string;            // Runtime instance
}

type MessageType = 
  | 'query'                      // Request for information
  | 'response'                   // Response to query
  | 'command'                    // Action request
  | 'event'                      // Notification
  | 'error'                      // Error report
  | 'validation'                 // Validation request/result
  | 'evidence'                   // Evidence submission
  | 'gap'                        // Data gap notification
  | 'correction';                // Correction request

interface MessagePayload {
  content: any;                  // Type-specific content
  format: 'json' | 'text' | 'markdown';
  language: 'en' | 'ar';
  encoding: 'utf-8';
}

interface MessageContext {
  sessionId: string;             // User session
  userId?: string;               // Requesting user
  requestId: string;             // Original request
  conversationId?: string;       // Conversation thread
  locale: string;                // User locale
  timezone: string;              // User timezone
}

interface EvidenceChain {
  sources: SourceReference[];
  confidence: number;            // 0-100
  citations: Citation[];
  provenance: ProvenanceRecord[];
}
```

---

## Message Types

### Query Message

Request for information from another agent.

```json
{
  "id": "msg-123e4567-e89b-12d3-a456-426614174000",
  "timestamp": "2025-01-29T10:30:00Z",
  "version": "1.0.0",
  "from": {
    "agentId": "one-brain",
    "instanceId": "ob-001"
  },
  "to": {
    "agentId": "macro-analyst",
    "instanceId": "ma-001"
  },
  "type": "query",
  "payload": {
    "content": {
      "question": "What is Yemen's current GDP?",
      "parameters": {
        "year": 2024,
        "source": "any",
        "regime": "national"
      }
    },
    "format": "json",
    "language": "en",
    "encoding": "utf-8"
  },
  "context": {
    "sessionId": "sess-abc123",
    "userId": "user-456",
    "requestId": "req-789",
    "locale": "en-US",
    "timezone": "UTC"
  },
  "evidence": {
    "sources": [],
    "confidence": 0,
    "citations": [],
    "provenance": []
  },
  "priority": "normal",
  "ttl": 30,
  "retryCount": 0
}
```

### Response Message

Response to a query with evidence.

```json
{
  "id": "msg-223e4567-e89b-12d3-a456-426614174001",
  "timestamp": "2025-01-29T10:30:05Z",
  "version": "1.0.0",
  "from": {
    "agentId": "macro-analyst",
    "instanceId": "ma-001"
  },
  "to": {
    "agentId": "one-brain",
    "instanceId": "ob-001"
  },
  "replyTo": "msg-123e4567-e89b-12d3-a456-426614174000",
  "type": "response",
  "payload": {
    "content": {
      "answer": "Yemen's GDP in 2024 is estimated at $17.24 billion USD.",
      "data": {
        "value": 17240000000,
        "unit": "USD",
        "year": 2024,
        "type": "estimate"
      }
    },
    "format": "json",
    "language": "en",
    "encoding": "utf-8"
  },
  "context": {
    "sessionId": "sess-abc123",
    "userId": "user-456",
    "requestId": "req-789",
    "locale": "en-US",
    "timezone": "UTC"
  },
  "evidence": {
    "sources": [
      {
        "id": "src-wb-001",
        "name": "World Bank",
        "type": "international_organization",
        "url": "https://data.worldbank.org/indicator/NY.GDP.MKTP.CD?locations=YE"
      }
    ],
    "confidence": 85,
    "citations": [
      {
        "text": "GDP (current US$) - Yemen, Rep.",
        "source": "World Bank WDI",
        "date": "2024",
        "url": "https://data.worldbank.org"
      }
    ],
    "provenance": [
      {
        "entity": "GDP_YEM_2024",
        "wasGeneratedBy": "macro-analyst",
        "wasDerivedFrom": "world_bank_wdi",
        "generatedAtTime": "2025-01-29T10:30:05Z"
      }
    ]
  },
  "priority": "normal",
  "ttl": 30,
  "retryCount": 0
}
```

### Error Message

Error notification with details.

```json
{
  "id": "msg-323e4567-e89b-12d3-a456-426614174002",
  "timestamp": "2025-01-29T10:30:10Z",
  "version": "1.0.0",
  "from": {
    "agentId": "data-connector-wb",
    "instanceId": "dc-wb-001"
  },
  "to": {
    "agentId": "one-brain",
    "instanceId": "ob-001"
  },
  "type": "error",
  "payload": {
    "content": {
      "code": "DATA_UNAVAILABLE",
      "message": "World Bank API returned 404 for requested indicator",
      "details": {
        "indicator": "NY.GDP.MKTP.CD",
        "country": "YE",
        "year": 2025
      },
      "recoverable": true,
      "suggestion": "Try alternative source or earlier year"
    },
    "format": "json",
    "language": "en",
    "encoding": "utf-8"
  },
  "context": {
    "sessionId": "sess-abc123",
    "requestId": "req-789",
    "locale": "en-US",
    "timezone": "UTC"
  },
  "evidence": {
    "sources": [],
    "confidence": 0,
    "citations": [],
    "provenance": []
  },
  "priority": "high",
  "ttl": 60,
  "retryCount": 0
}
```

### Gap Message

Data gap notification.

```json
{
  "id": "msg-423e4567-e89b-12d3-a456-426614174003",
  "timestamp": "2025-01-29T10:30:15Z",
  "version": "1.0.0",
  "from": {
    "agentId": "gap-ticket-creator",
    "instanceId": "gtc-001"
  },
  "to": {
    "agentId": "admin-monitor",
    "instanceId": "am-001"
  },
  "type": "gap",
  "payload": {
    "content": {
      "gapType": "missing_data",
      "indicator": "Unemployment Rate",
      "geography": "Yemen",
      "period": "Q2 2024",
      "priority": "medium",
      "suggestedSources": ["ILO", "CSO Yemen"],
      "lastAvailable": {
        "period": "Q1 2024",
        "value": 13.4,
        "source": "ILO"
      }
    },
    "format": "json",
    "language": "en",
    "encoding": "utf-8"
  },
  "context": {
    "sessionId": "sess-abc123",
    "requestId": "req-789",
    "locale": "en-US",
    "timezone": "UTC"
  },
  "evidence": {
    "sources": [],
    "confidence": 0,
    "citations": [],
    "provenance": []
  },
  "priority": "low",
  "ttl": 3600,
  "retryCount": 0
}
```

---

## Validation Rules

All messages must pass these validations:

1. **Required Fields**: id, timestamp, version, from, to, type, payload
2. **UUID Format**: id must be valid UUID v4
3. **Timestamp Format**: ISO 8601 with timezone
4. **Agent IDs**: Must exist in AGENTOS_MANIFEST
5. **Evidence Chain**: Required for response messages
6. **Confidence Range**: 0-100 for evidence.confidence

---

## Error Codes

| Code | Description | Recoverable |
|------|-------------|-------------|
| DATA_UNAVAILABLE | Requested data not found | Yes |
| SOURCE_ERROR | External source API error | Yes |
| VALIDATION_FAILED | Message validation failed | No |
| TIMEOUT | Request timed out | Yes |
| FABRICATION_DETECTED | Evidence law R0 violation | No |
| SAFETY_VIOLATION | Safety policy violation | No |
| UNAUTHORIZED | Agent not authorized | No |

---

## Logging

All messages are logged with:

```typescript
interface MessageLog {
  messageId: string;
  timestamp: string;
  direction: 'sent' | 'received';
  fromAgent: string;
  toAgent: string;
  type: MessageType;
  status: 'success' | 'error' | 'timeout';
  latencyMs: number;
  evidenceCount: number;
  confidenceScore: number;
}
```

---

## Control Pack Version

**Tag:** v0.0-control-pack
