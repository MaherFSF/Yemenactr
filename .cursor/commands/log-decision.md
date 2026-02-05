---
name: log-decision
description: Log an architectural or implementation decision
---

# Log Decision

Add an entry to `docs/DECISIONS.md` documenting a significant decision.

## When to log

Log decisions when:
- Multiple valid approaches exist
- Made a tradeoff between competing concerns
- Chose a default when requirements unclear
- Made a judgment call affecting architecture
- Deviated from a pattern for good reason

## Decision format

```markdown
### DEC-{NNNN} — {Short Title}

**Date:** {YYYY-MM-DD}
**Context:** {What problem or question triggered this}
**Decision:** {What was decided}
**Rationale:** {Why this choice}
**Alternatives considered:** {Other options and why not chosen}
**Consequences:** {Tradeoffs, risks, or follow-ups}
**Status:** {ACTIVE/SUPERSEDED/DEPRECATED}
```

## Best practices

- Be concise but complete
- Focus on "why" not just "what"
- Note tradeoffs honestly
- Link to related gap tickets or issues
- Update status if decision is later changed
