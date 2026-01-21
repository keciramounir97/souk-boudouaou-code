# Supabase deployment notes

This repo uses:

- `backend/`: Node.js (Express) API using Prisma.
- `frontend/`: Vite React app.

Supabase is used here as the Postgres database (and optionally Auth/Storage, if you add them later). Supabase does not host this Express server directly; deploy the backend to a Node host and point it at your Supabase Postgres.

## Database (Supabase Postgres)

1. Create a Supabase project.
2. Get the database connection string from the Supabase dashboard.
3. Set `backend/.env`:
   - `DATABASE_URL`: use the pooler URL if you want connection pooling at runtime.
   - `DIRECT_URL`: use the direct Postgres URL (port 5432) for Prisma schema operations.

The Prisma schema already targets `postgresql` (backend/prisma/schema.prisma).

To apply the schema to Supabase Postgres:

```bash
npm --prefix backend install
npm --prefix backend run prisma:generate
npm --prefix backend run prisma:push
```

## Supabase CLI (optional)

If you want to manage the Supabase project from this repo with the Supabase CLI:

```bash
supabase login
supabase link --project-ref <your-project-ref>
```

This repo includes a minimal config file at supabase/config.toml with a blank `project_id`; the CLI will populate it during linking.

## Frontend API URL

If the frontend and backend are deployed under different domains, set:

- `frontend/.env`: `VITE_API_URL=https://your-backend-host`

If they share the same origin (or you use a reverse proxy), `VITE_API_URL` can stay empty and the frontend will use relative `/api/*` calls.
