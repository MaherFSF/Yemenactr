# Database Migration

Apply database migrations using Drizzle Kit.

```bash
pnpm db:push
```

This will:
1. Generate migration files from schema changes
2. Apply migrations to the database
3. Update the database schema

**Important**: Always backup production data before running migrations!

For development, set your DATABASE_URL in `.env`:

```
DATABASE_URL=mysql://user:password@localhost:3306/yeto_dev
```
