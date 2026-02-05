---
name: audit-route
description: Audit a route against release gates
---

# Audit Route

Perform a comprehensive audit of a route against all release gates.

## Usage

Specify the route to audit (e.g., `/banking`, `/admin/release-gate`, `/vip/president`)

## Checklist

### Evidence & Provenance
- [ ] All displayed metrics have evidence packs
- [ ] "Show Evidence" functionality works
- [ ] No hardcoded demo data
- [ ] Gap Cards shown for missing data

### Split-system (Yemen context)
- [ ] regime_tag filter/selector present
- [ ] No mixed-regime aggregations
- [ ] Comparison mode available if relevant

### Bilingual
- [ ] English version works
- [ ] Arabic version works
- [ ] RTL layout correct
- [ ] Charts render in RTL
- [ ] Navigation works in both languages

### RBAC (if protected)
- [ ] Server-side auth check exists
- [ ] Correct role required
- [ ] Unauthorized access blocked

### Exports (if applicable)
- [ ] CSV export works
- [ ] PNG/chart export works
- [ ] Exports work in both EN/AR
- [ ] Evidence included in exports

### Performance
- [ ] Page loads < 3s
- [ ] No console errors
- [ ] No TypeScript errors

## Output

Add or update entry in `docs/ROUTE_INVENTORY.md`:

```markdown
#### {Route path}
- **Status:** {PASS/NEEDS_WORK/BLOCKED}
- **Evidence gate:** {PASS/FAIL - reason}
- **Split-system gate:** {PASS/FAIL/N/A - reason}
- **Bilingual gate:** {PASS/FAIL - reason}
- **RBAC gate:** {PASS/FAIL/N/A - reason}
- **Notes:** {any issues or follow-ups}
```
