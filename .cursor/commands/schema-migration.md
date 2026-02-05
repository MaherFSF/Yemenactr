---
name: schema-migration
description: Create a governance-safe database schema migration
---

# Schema Migration (Governance-Safe)

Create database migration following governance rules.

## Rules

1. **Additive only** (unless explicitly approved for destructive)
2. **Backward compatible** where possible
3. **Documented** with clear purpose
4. **Tested** before commit

## Migration checklist

### Planning
- [ ] What tables/columns are affected?
- [ ] Is this additive or destructive?
- [ ] Does it affect evidence/provenance chain?
- [ ] Does it affect split-system (regime_tag)?
- [ ] What data needs backfilling?

### Implementation
- [ ] Create migration in `drizzle/` folder
- [ ] Add up migration (apply changes)
- [ ] Add down migration (rollback)
- [ ] Update schema definitions in `server/db/schema/`
- [ ] Update TypeScript types
- [ ] Update seed data if relevant

### Documentation
- [ ] Add entry to `docs/DECISIONS.md` explaining why
- [ ] Update `docs/DATA_ARCHITECTURE.md` if significant
- [ ] Document backfill strategy if needed
- [ ] Note in PR description

### Testing
- [ ] Run migration on clean DB
- [ ] Run migration on DB with data
- [ ] Verify rollback works
- [ ] Check that queries still work
- [ ] Run CI checks

## Example: Adding regime_tag

```sql
-- Up migration
ALTER TABLE observations 
ADD COLUMN regime_tag TEXT 
CHECK (regime_tag IN ('IRG', 'DFA', 'NATIONWIDE'));

CREATE INDEX idx_observations_regime_tag 
ON observations(regime_tag);

-- Down migration
DROP INDEX idx_observations_regime_tag;
ALTER TABLE observations DROP COLUMN regime_tag;
```

## After migration

1. Update `docs/SCHEMA_V{X}.md` with new version
2. Document in PR
3. Create follow-up tickets for backfilling if needed
4. Update release gate status
