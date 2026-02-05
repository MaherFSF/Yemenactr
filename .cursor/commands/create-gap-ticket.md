---
name: create-gap-ticket
description: Create a gap ticket for missing data or functionality
---

# Create Gap Ticket

Create a structured gap ticket in `docs/GAP_TICKETS.md`.

## Information needed

Ask for or infer:
1. What is missing? (data, feature, documentation)
2. Which sector/module/route is affected?
3. What is the impact? (blocking, nice-to-have)
4. Any known sources or solutions?

## Ticket format

```markdown
### GAP-{NNNN} — {Short Title}

**Status:** OPEN
**Created:** {date}
**Impact:** {HIGH/MEDIUM/LOW}
**Category:** {Data/Feature/Documentation/Infrastructure}

**Description:**
{What is missing}

**Affected:**
{Routes, sectors, or features impacted}

**Possible solutions:**
{Known sources, workarounds, or implementation approaches}

**Action owner:**
{Team/person responsible, or "UNASSIGNED"}
```

## After creating ticket

1. Add ticket reference to any Gap Cards in UI
2. Update `docs/ROUTE_INVENTORY.md` if route affected
3. Note in `docs/DECISIONS.md` if you made a default decision
