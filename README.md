# souk-boudouaou-code

## Structure

- `frontend/`: Vite + React app
- `backend/`: Express API + Prisma (Postgres)

## Local development

1. Create env files:
   - `backend/.env` from `backend/.env.example`
   - `frontend/.env` from `frontend/.env.example`
2. Install dependencies:

```bash
npm run install:all
```

3. Run backend (defaults to port 3000):

```bash
npm run backend:dev
```

4. Run frontend (defaults to port 5000):

```bash
npm run frontend:dev
```

## Build

```bash
npm run build
```

## Supabase

See [SUPABASE.md](SUPABASE.md).
