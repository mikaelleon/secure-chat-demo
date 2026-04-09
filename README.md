# Secure Chat Demo

A Vite + React chat application that demonstrates **client-side encryption** with **Supabase** for auth, Postgres, and Realtime. Message **plaintext is never stored** in the database; only ciphertext and metadata (mode, shift) are persisted. Readable text is derived locally after fetch.

## Features

- Email/password auth, forgot password, reset password, profile settings  
- Conversations between registered users (lookup by email)  
- Symmetric (Caesar-style) and asymmetric modes in the UI; ciphertext-only storage  
- Supabase Realtime for live message delivery (RLS-scoped private channels)  
- Encryption inspector with Framer Motion visualizations and session log  

## Tech stack

| Layer | Choice |
|--------|--------|
| UI | React 18, TypeScript, Tailwind CSS, shadcn-style components, Framer Motion |
| Build | Vite 5 (`@vitejs/plugin-react-swc`) |
| Backend | Supabase (Auth, PostgREST, Realtime) |
| Routing | React Router v6 |

## Quick start

1. **Prerequisites:** Node.js **20+** (recommended), **pnpm** 9+, a **Supabase** project.  
2. **Clone & install:** `pnpm install`  
3. **Database:** Run the SQL under `sql/ddl/` in order (see [docs/local-setup.md](docs/local-setup.md)).  
4. **Environment:** Copy `.env.example` → `.env` and set `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY`.  
5. **Run:** `pnpm dev` → open [http://localhost:8080](http://localhost:8080) (see Vite config).

Full contributor walkthrough (IDE-specific notes, Auth redirect URLs, SQL order, troubleshooting) lives in **[docs/local-setup.md](docs/local-setup.md)**.

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start dev server (default port **8080**) |
| `pnpm build` | Production build to `dist/` |
| `pnpm preview` | Serve production build locally |
| `pnpm lint` | ESLint |
| `pnpm test` | Vitest (once) |

## Repository layout

```
src/           Application source (pages, hooks, components, Supabase client)
sql/ddl/       Schema, RLS, triggers, Realtime publication (apply in order)
sql/ddl/patches/ Optional migrations for existing databases
sql/dml/       Optional data fixes (e.g. backfills)
docs/          Contributor documentation
```

## Security model (high level)

- **Row Level Security** on `profiles`, `conversations`, and `messages` so users only read rows they are allowed to see.  
- **Realtime** uses private channels with JWT so `postgres_changes` respects the same RLS as REST.  
- **Demo crypto** is for education; do not rely on it for real secret communications.

## License

Private / team project — add a `LICENSE` file if you distribute publicly.
