# One Brain Intelligence Audit Report

**Audit Date:** January 15, 2026  
**Auditor:** YETO Platform AI Engineering Team  
**Scope:** Complete audit of existing One Brain implementation

---

## Executive Summary

The YETO platform contains **three One Brain implementations** that have evolved over time:

1. **Original One Brain** (`server/ai/oneBrain.ts`) - Basic LLM wrapper with static knowledge base
2. **Enhanced One Brain** (`server/ai/oneBrainEnhanced.ts`) - RAG-enabled with database retrieval
3. **One Brain Directive** (`server/ml/core/oneBrainDirective.ts`) - Advanced ML-driven intelligence layer

This audit identifies what works well, what needs improvement, and provides a unified upgrade path.

---

## 1. Current Implementation Analysis

### 1.1 Original One Brain (`oneBrain.ts`)

**Lines of Code:** 514  
**Last Updated:** January 10, 2026

**Strengths:**
- ✅ Bilingual support (Arabic/English)
- ✅ Evidence pack structure with sources, indicators, methodology, caveats
- ✅ Confidence ratings (A-D)
- ✅ Knowledge base for common queries (exchange rates, central bank, food insecurity)
- ✅ Banking context integration
- ✅ Recent events awareness (STC dissolution, CBY updates)

**Weaknesses:**
- ❌ **STATIC KNOWLEDGE BASE** - Hardcoded answers, not dynamic
- ❌ No database retrieval - relies on predefined responses
- ❌ No evidence verification - claims are not validated against data
- ❌ No data gap ticket creation
- ❌ No contradiction detection
- ❌ No role-aware responses
- ❌ No scenario projections
- ❌ No audit trail

### 1.2 Enhanced One Brain (`oneBrainEnhanced.ts`)

**Lines of Code:** 500+  
**Last Updated:** January 12, 2026

**Strengths:**
- ✅ Database-backed RAG (Retrieval-Augmented Generation)
- ✅ Evidence pack generation with source citations
- ✅ Time travel queries ("what was known at date X")
- ✅ Multi-turn conversation with context memory
- ✅ Specialized analysis modes (macro, FX, humanitarian, fiscal, trade)
- ✅ Visualization generation suggestions
- ✅ Query type detection (factual, analytical, forecast, comparison, timeline)
- ✅ Regime-aware responses (IRG vs DFA)

**Weaknesses:**
- ❌ No knowledge graph integration
- ❌ No role-specific intelligence modes
- ❌ No scenario projections with uncertainty bands
- ❌ No data gap ticket auto-creation
- ❌ No contradiction detection with disagreement mode
- ❌ No visual intelligence (chart generation)
- ❌ Limited audit trail

### 1.3 One Brain Directive (`oneBrainDirective.ts`)

**Lines of Code:** 900+  
**Last Updated:** January 15, 2026

**Strengths:**
- ✅ Zero fabrication enforcement
- ✅ Evidence-packed answer structure (9-part format)
- ✅ Role-aware intelligence modes (7 roles)
- ✅ Knowledge graph with nodes and edges
- ✅ Scenario projections with uncertainty bands
- ✅ Data gap ticket auto-creation
- ✅ Contradiction detection with disagreement mode
- ✅ Full audit trail
- ✅ Core institutions pre-loaded

**Weaknesses:**
- ❌ Not integrated with existing AI chat UI
- ❌ Knowledge graph not populated from database
- ❌ Visual intelligence not implemented
- ❌ Not used across all site pages
- ❌ No inline explanations for charts/KPIs

---

## 2. Hallucination Risk Assessment

### 2.1 Where Hallucination Can Occur

| Component | Risk Level | Mitigation Status |
|-----------|------------|-------------------|
| Original One Brain | **HIGH** | Static answers may become outdated |
| Enhanced One Brain | **MEDIUM** | RAG helps but no verification |
| One Brain Directive | **LOW** | Zero fabrication enforced |
| AI Chat UI | **MEDIUM** | Uses Enhanced One Brain |
| Report Narratives | **MEDIUM** | Template-based but LLM-generated |
| Scenario Simulator | **LOW** | Uses explicit models with assumptions |

### 2.2 Specific Hallucination Risks

1. **Exchange Rate Claims** - Original One Brain has hardcoded rates that may be outdated
2. **Event Dates** - Static knowledge base may have incorrect dates
3. **Source Citations** - LLM may fabricate source names if not grounded
4. **Statistics** - Numbers may be invented if not retrieved from database
5. **Forecasts** - Predictions may lack uncertainty quantification

---

## 3. Evidence Grounding Assessment

### 3.1 Current State

| Feature | Original | Enhanced | Directive |
|---------|----------|----------|-----------|
| Source citations | ✅ Static | ✅ Dynamic | ✅ Dynamic |
| Confidence ratings | ✅ | ✅ | ✅ |
| Data retrieval | ❌ | ✅ | ✅ |
| Evidence verification | ❌ | ❌ | ✅ |
| Provenance tracking | ❌ | Partial | ✅ |
| Transformation logs | ❌ | ❌ | ✅ |

### 3.2 Gaps in Evidence Grounding

1. **No verification layer** - Claims are not cross-checked against database
2. **No contradiction detection** - Conflicting sources not identified
3. **No data gap tickets** - Missing data not flagged
4. **No "Show me how you know"** - Users cannot inspect evidence

---

## 4. Visual Intelligence Assessment

### 4.1 Current Capabilities

- ❌ **Chart generation** - Not implemented
- ❌ **Timeline visualization** - Not implemented
- ❌ **Before/after views** - Not implemented
- ❌ **Annotated visuals** - Not implemented
- ❌ **Bilingual chart labels** - Not implemented
- ❌ **Uncertainty visualization** - Not implemented

### 4.2 Required Visual Capabilities

1. Choose appropriate visual form for insights
2. Generate charts, timelines, comparisons
3. Annotate with meaning (what changed, why it matters)
4. Ensure bilingual labels (EN/AR)
5. RTL-correct for Arabic
6. Include units, sources, confidence
7. Only render if evidence-backed

---

## 5. Logic Duplication Assessment

### 5.1 Duplicated Logic Found

| Logic | Location 1 | Location 2 | Issue |
|-------|-----------|-----------|-------|
| Exchange rate formatting | oneBrain.ts | db.ts | Different formats |
| Confidence rating | oneBrain.ts | oneBrainDirective.ts | Different scales |
| Language detection | oneBrain.ts | oneBrainEnhanced.ts | Duplicated |
| Query type detection | oneBrainEnhanced.ts | mlRouter.ts | Duplicated |
| Evidence pack structure | oneBrain.ts | oneBrainEnhanced.ts | Different schemas |

### 5.2 Consolidation Needed

All AI logic should flow through the One Brain Directive to ensure:
- Consistent behavior
- Single source of truth
- Unified audit trail
- No competing intelligence layers

---

## 6. Missing AI Integration Points

### 6.1 Where AI Should Be Used But Isn't

| Page/Feature | Current State | AI Value |
|--------------|---------------|----------|
| Dashboard KPIs | Static tooltips | Inline explanations |
| Chart annotations | None | "What changed" insights |
| Glossary terms | Static definitions | Context-aware explanations |
| Timeline events | Basic descriptions | Causal analysis |
| Report builder | Template-based | Smart narrative generation |
| Scenario simulator | Basic projections | Uncertainty explanations |
| Alert notifications | Raw signals | Interpreted alerts |
| Partner submissions | Manual review | AI-assisted QA |

### 6.2 Priority Integration Points

1. **Dashboard KPIs** - Add "Why this matters" tooltips
2. **Charts** - Add "Key insight" annotations
3. **Timeline** - Add "Before/after" analysis
4. **Alerts** - Add "What to watch next" recommendations
5. **Reports** - Add executive summary generation

---

## 7. Articulation Quality Assessment

### 7.1 Current Writing Style

**Original One Brain:**
- ✅ Clear structure
- ❌ Generic AI phrasing ("As of...", "It's important to note...")
- ❌ Sometimes verbose
- ❌ Inconsistent tone

**Enhanced One Brain:**
- ✅ Better structure
- ✅ More technical depth
- ❌ Still uses AI clichés
- ❌ Can be overly academic

**One Brain Directive:**
- ✅ Role-aware responses
- ✅ Structured output
- ❌ Not yet integrated with UI

### 7.2 Target Articulation Standard

- Calm, precise, intentional
- No generic AI phrasing
- No academic clutter
- No exaggerated certainty
- Well-paced explanations
- Confident but restrained
- Clear about uncertainty
- Explains "why" not just "what"

---

## 8. Governance & Auditability Assessment

### 8.1 Current State

| Feature | Status | Notes |
|---------|--------|-------|
| Prompt versioning | ❌ | Prompts not version-controlled |
| Retrieval logging | Partial | Some logging in Enhanced |
| Output auditing | ❌ | No audit trail stored |
| Admin override | ❌ | No admin controls |
| Sensitive topic constraints | ❌ | No topic restrictions |
| Evidence inspection | ❌ | Users cannot verify claims |

### 8.2 Required Governance Features

1. **Prompt Registry** - Version-controlled prompts with changelogs
2. **Retrieval Logging** - Log every database query and result
3. **Output Auditing** - Store all AI responses with evidence packs
4. **Admin Controls** - Override/suspend outputs for sensitive topics
5. **Evidence Inspection** - "Show me how you know" for every claim
6. **Learning Governance** - Only learn from approved sources

---

## 9. Recommendations

### 9.1 Immediate Actions (P0)

1. **Consolidate to One Brain Directive** - Make it the single intelligence layer
2. **Wire to AI Chat UI** - Replace current chat with Directive
3. **Add visual intelligence** - Implement chart generation
4. **Create audit trail** - Log all AI interactions

### 9.2 Short-term Actions (P1)

1. **Populate knowledge graph** - Sync from database
2. **Add inline explanations** - KPIs, charts, timeline
3. **Implement "Show me how you know"** - Evidence inspection
4. **Add admin controls** - Override sensitive topics

### 9.3 Medium-term Actions (P2)

1. **Articulation upgrade** - Remove AI clichés
2. **Translation QA** - Glossary enforcement
3. **Learning governance** - Approved source learning only
4. **Performance optimization** - Caching, precomputation

---

## 10. Conclusion

The YETO platform has a solid foundation for AI intelligence, but it is fragmented across three implementations. The One Brain Directive represents the most advanced and compliant implementation, but it is not yet integrated with the user-facing UI.

**Key Finding:** The platform needs to consolidate all AI logic through the One Brain Directive to achieve:
- Zero fabrication
- Evidence grounding
- Visual intelligence
- Consistent articulation
- Full auditability

**Next Step:** Create ONE_BRAIN_UPGRADE_PLAN.md with detailed implementation roadmap.
