# YETO Glossary Rules & Standards

## Purpose

The YETO Glossary provides standardized definitions for economic, financial, and humanitarian terms used throughout the platform. All terms are presented bilingually (Arabic/English) with Yemen-specific examples and cross-references.

## Glossary Structure

### Term Entry Format

Each glossary term includes:

| Field | Required | Description |
|-------|----------|-------------|
| `termEn` | Yes | English term |
| `termAr` | Yes | Arabic term |
| `definitionEn` | Yes | English definition |
| `definitionAr` | Yes | Arabic definition |
| `yemenExampleEn` | Recommended | Yemen-specific example (English) |
| `yemenExampleAr` | Recommended | Yemen-specific example (Arabic) |
| `relatedChartSpecId` | Optional | Mini chart visualization |
| `crossLinks` | Recommended | Related term IDs |
| `category` | Yes | Term category |

### Example Entry

```json
{
  "termEn": "Exchange Rate",
  "termAr": "سعر الصرف",
  "definitionEn": "The value of one currency expressed in terms of another currency.",
  "definitionAr": "قيمة عملة واحدة معبراً عنها بعملة أخرى.",
  "yemenExampleEn": "In Yemen, the exchange rate varies significantly between Aden (IRG-controlled) and Sana'a (DFA-controlled) areas, with the Aden rate typically 1,600-1,700 YER/USD and Sana'a rate fixed at 250 YER/USD.",
  "yemenExampleAr": "في اليمن، يختلف سعر الصرف بشكل كبير بين عدن (تحت سيطرة الحكومة الشرعية) وصنعاء (تحت سيطرة أنصار الله)، حيث يبلغ سعر عدن عادة 1,600-1,700 ريال/دولار بينما سعر صنعاء ثابت عند 250 ريال/دولار.",
  "category": "monetary",
  "crossLinks": [12, 45, 78]
}
```

## Categories

### Term Categories

| Category | Description | Examples |
|----------|-------------|----------|
| `monetary` | Currency, exchange, banking | Exchange rate, inflation, M2 |
| `fiscal` | Government finance | Budget deficit, public debt |
| `trade` | International trade | Imports, exports, trade balance |
| `humanitarian` | Aid and development | IPC, food security, displacement |
| `conflict` | Conflict-related economics | Sanctions, dual economy |
| `infrastructure` | Physical infrastructure | Ports, roads, utilities |
| `energy` | Energy sector | Oil production, fuel prices |
| `agriculture` | Agricultural sector | Crop production, food prices |

## Bilingual Standards

### Arabic Translation Requirements

1. **Accuracy**: Translations must be technically accurate
2. **Consistency**: Same term always translated the same way
3. **Clarity**: Use clear, accessible Arabic
4. **Standard Arabic**: Use Modern Standard Arabic (MSA)

### Side-by-Side Display

The glossary displays Arabic and English side-by-side:

```
┌─────────────────────────────────────────────────────────────┐
│ Exchange Rate                              سعر الصرف       │
├─────────────────────────────────────────────────────────────┤
│ The value of one currency     │ قيمة عملة واحدة معبراً    │
│ expressed in terms of         │ عنها بعملة أخرى.          │
│ another currency.             │                            │
├─────────────────────────────────────────────────────────────┤
│ Yemen Example:                │ مثال من اليمن:            │
│ In Yemen, the exchange rate   │ في اليمن، يختلف سعر       │
│ varies significantly...       │ الصرف بشكل كبير...        │
└─────────────────────────────────────────────────────────────┘
```

## Yemen-Specific Examples

### Requirements

Every term SHOULD include a Yemen-specific example that:

1. **Illustrates the concept** in Yemen's context
2. **Uses real data** from the platform
3. **Acknowledges complexity** (e.g., dual economy)
4. **Remains neutral** regarding political situations

### Example Guidelines

| Good Example | Poor Example |
|--------------|--------------|
| "Yemen's inflation rate reached 35% in 2024" | "Inflation is high" |
| "The CBY-Aden and CBY-Sana'a operate different monetary policies" | "The central bank is divided" |
| "Food imports through Hodeidah port decreased 20% in Q3 2024" | "Imports are down" |

## Mini Charts

### Integration

Terms can include mini visualizations:

```typescript
{
  termEn: "Inflation Rate",
  relatedChartSpecId: 45, // Links to visualization_specs table
  // Chart shows Yemen inflation trend
}
```

### Chart Requirements

- Simple, clear visualization
- Mobile-friendly size
- Accessible colors
- Bilingual labels

## Cross-Links

### Linking Related Terms

Terms should link to related concepts:

```typescript
{
  termEn: "Money Supply (M2)",
  crossLinks: [12, 34, 56], // IDs of related terms
  // Links to: Inflation, Central Bank, Exchange Rate
}
```

### Display

Cross-links appear as:
> **Related Terms**: Inflation Rate, Central Bank, Exchange Rate

## Versioning

### Version Control

All glossary edits are versioned:

```typescript
interface GlossaryVersion {
  termId: number;
  version: number;
  termEn: string;
  termAr: string;
  definitionEn: string;
  definitionAr: string;
  changeReason: string;
  changedBy: number;
  changedAt: Date;
}
```

### Change Tracking

| Change Type | Requires |
|-------------|----------|
| Typo fix | Version increment |
| Definition update | Version increment + reason |
| New example | Version increment |
| Translation correction | Version increment + reason |

## Editorial Process

### Adding New Terms

1. **Proposal**: Submit term with all required fields
2. **Review**: Editorial review for accuracy
3. **Translation**: Arabic translation review
4. **Approval**: Final approval by editor
5. **Publication**: Term added to glossary

### Updating Terms

1. **Edit Request**: Submit proposed changes
2. **Review**: Compare with current version
3. **Approval**: Approve changes
4. **Version**: Create new version with reason
5. **Publication**: Update live glossary

## Quality Standards

### Definition Quality

| Criterion | Requirement |
|-----------|-------------|
| Accuracy | Technically correct |
| Clarity | Understandable by non-experts |
| Completeness | Covers essential aspects |
| Neutrality | No political bias |
| Currency | Up-to-date information |

### Review Checklist

- [ ] English definition is accurate
- [ ] Arabic translation is correct
- [ ] Yemen example is relevant
- [ ] Cross-links are appropriate
- [ ] Category is correct
- [ ] No political bias

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `glossary.list` | Query | List all terms |
| `glossary.get` | Query | Get single term |
| `glossary.search` | Query | Search terms |
| `glossary.create` | Mutation | Create new term |
| `glossary.update` | Mutation | Update term |
| `glossary.versions` | Query | Get term versions |

## Accessibility

### Requirements

- Screen reader compatible
- Keyboard navigable
- High contrast mode
- RTL support for Arabic
- Mobile responsive

---

*Last Updated: January 14, 2026*
