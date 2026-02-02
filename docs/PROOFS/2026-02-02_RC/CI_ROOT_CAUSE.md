# CI Failure Root Cause Analysis

**Date:** 2026-02-02
**Run:** #10 (Attempt #3)
**URL:** https://github.com/MaherFSF/Yemenactr/actions/runs/21599289072

## Root Cause Identified

**Error:** `Identifier name 'research_completeness_audit_organizationId_research_organizations_id_fk' is too long`

**Location:** Drizzle ORM schema migration during `db:push`

**Explanation:** 
MySQL has a 64-character limit for identifier names (table names, column names, index names, foreign key names). The auto-generated foreign key name `research_completeness_audit_organizationId_research_organizations_id_fk` is **79 characters**, exceeding the limit.

## Fix Required

1. Shorten the foreign key constraint name in `drizzle/schema.ts`
2. Use explicit shorter names for foreign key references

## Affected Table

`research_completeness_audit` table with foreign key to `research_organizations`

## Steps to Fix

1. Find the `research_completeness_audit` table definition in `drizzle/schema.ts`
2. Add explicit shorter names for foreign key constraints using `.references()` with custom name
3. Run `pnpm db:push` locally to verify
4. Commit and push to trigger new CI run
