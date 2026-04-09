# Local development setup

This guide walks contributors through running **Secure Chat Demo** on their machine. The app is editor-agnostic; use the section that matches your **preferred IDE** (VS Code, Cursor, or any other).

---

## 1. What you need installed

| Tool | Notes |
|------|--------|
| **Git** | To clone the repository. |
| **Node.js** | **20.x or newer** LTS is recommended (matches modern Vite). |
| **pnpm** | Package manager used by this project (`corepack enable` then `corepack prepare pnpm@latest --activate`, or install via npm). |
| **A Supabase account** | Free tier is fine. You will create (or reuse) one project for local development. |

Verify in a terminal:

```bash
node -v
pnpm -v
git --version
```

---

## 2. Get the code and install dependencies

```bash
git clone <your-repo-url> secure-chat-demo
cd secure-chat-demo
pnpm install
```

---

## 3. Open the project in your editor

### Visual Studio Code

1. **File → Open Folder…** and choose the `secure-chat-demo` root (the folder that contains `package.json`).  
2. Optional: install extensions the team uses — **ESLint**, **Prettier** (if the repo adds config), **Tailwind CSS IntelliSense**.  
3. Open the integrated terminal (**Ctrl+`** or **View → Terminal**) — default shell (PowerShell, bash, etc.) is fine.  
4. Run commands from **section 7** onward from that terminal.

### Cursor

1. **File → Open Folder** and select the **same repository root** as above.  
2. Cursor is VS Code–compatible; the same extensions and terminal workflow apply.  
3. Use the Cursor terminal for `pnpm` commands.  
4. If you use AI rules or skills for this monorepo, keep them scoped to this workspace so they do not conflict with other projects.

### Other IDEs (WebStorm, Neovim, etc.)

1. Open the **repository root** as the project root.  
2. Configure TypeScript to use the workspace `tsconfig.json` / `tsconfig.app.json`.  
3. Run all CLI steps from a terminal whose **working directory** is the repo root.

**Important:** Always run `pnpm` scripts from the directory that contains `package.json`, not from `src/` or `sql/`.

---

## 4. Create or choose a Supabase project

1. Sign in at [https://supabase.com](https://supabase.com).  
2. **New project** (or pick an existing dev project). Note the **project URL** and **anon (public) key** under **Project Settings → API**.  
3. You will run SQL from this repo in the Supabase **SQL Editor** (next section).

---

## 5. Apply database schema (SQL)

Run scripts **in order** in the Supabase SQL Editor unless your team uses migrations elsewhere.

### Fresh database (recommended for new contributors)

Execute these files **from the repo**, in this sequence:

1. `sql/ddl/01_tables.sql` — tables (`profiles`, `conversations`, `messages`)  
2. `sql/ddl/02_rls_policies.sql` — Row Level Security policies  
3. `sql/ddl/03_functions_triggers.sql` — `handle_new_user` trigger for `auth.users`  
4. `sql/ddl/04_realtime.sql` — adds `messages` / `conversations` to the `supabase_realtime` publication (safe to re-run)

Copy-paste each file’s contents into the SQL Editor and run it. Fix any error before moving to the next file.

### Patches (existing / older databases only)

- `sql/ddl/patches/001_add_profiles_email.sql` — if an old DB is missing `profiles.email`  
- `sql/ddl/patches/002_messages_ciphertext_only.sql` — drops legacy plaintext columns if they exist  

### Optional DML

- `sql/dml/backfill_profile_emails.sql` — only if you need to backfill emails on existing rows (see comments in that file)

---

## 6. Configure Supabase Auth for local dev

The app uses **React Router** on port **8080** (see `vite.config.ts`).

In Supabase: **Authentication → URL Configuration**:

| Setting | Suggested value (local) |
|---------|-------------------------|
| **Site URL** | `http://localhost:8080` |
| **Redirect URLs** | Add `http://localhost:8080` and `http://localhost:8080/**` (or explicit paths like `http://localhost:8080/reset-password` if you prefer listing them) |

This matters for email confirmation links and **password reset** (reset flow uses `/reset-password` in the app).

For production, add your real origin(s) the same way.

---

## 7. Environment variables

1. In the repo root, copy the example file:

   ```bash
   cp .env.example .env
   ```

   On Windows PowerShell you can use `Copy-Item .env.example .env`.

2. Edit `.env`:

   - **`VITE_SUPABASE_URL`** — Project URL from Supabase API settings.  
     - Use **no trailing slash** and **no path** (not `/rest/v1/`).  
     - Opening the bare URL in a browser may show `{"error":"requested path is invalid"}` — that is normal; the JS client adds the correct paths.  
   - **`VITE_SUPABASE_ANON_KEY`** — the **anon public** JWT from the same page.  
   - Alternatively, some dashboards expose **`VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY`** — you can use that **instead** of `VITE_SUPABASE_ANON_KEY` (only one key is required).

3. Restart `pnpm dev` after changing `.env`.

Never commit `.env`; only `.env.example` belongs in Git.

---

## 8. Run the app

From the repository root:

```bash
pnpm dev
```

Open **http://localhost:8080**.

- Register two users (or use two browsers / incognito) to test chats.  
- Start a chat via the other user’s **email** (they must have signed up already).  
- Realtime requires the publication step (`04_realtime.sql`) and a logged-in session.

Other useful commands:

```bash
pnpm build    # production build
pnpm lint     # ESLint
pnpm test     # Vitest
```

---

## 9. Smoke checklist

- [ ] Login and register work.  
- [ ] `/forgot-password` and `/reset-password` work with Auth URLs configured.  
- [ ] `/profile` loads and updates display name.  
- [ ] New chat by partner email creates/opens a conversation.  
- [ ] Messages appear in the thread and (with two clients) update via Realtime without full refresh.  
- [ ] Session log in the Encryption Inspector updates when you send.

---

## 10. Troubleshooting

| Symptom | Things to check |
|---------|------------------|
| Blank auth / API errors | `.env` URL and anon key; no trailing slash on URL; dev server restarted. |
| “Invalid” JSON at Supabase URL in browser | Expected if you open only the host — not an app bug. |
| Realtime never updates | Run `04_realtime.sql`; confirm tables are in publication; user must be signed in (`realtime.setAuth` uses the session). |
| Messages missing in thread but in DB | Should be resolved by current client merge + insert `.select()`; pull latest and hard-refresh. |
| RLS / permission errors | Re-run `02_rls_policies.sql`; confirm user is authenticated and is a participant in the conversation. |
| Wrong port | This project defaults to **8080**, not Vite’s 5173. Use `http://localhost:8080` or change `vite.config.ts`. |

---

## 11. Getting help

- Compare your `.env` with `.env.example` (no secrets in chat — use placeholders).  
- Confirm SQL was applied in order without errors.  
- Ask a maintainer with your **Node / pnpm versions**, **OS**, and **browser console + network** errors if something still fails.
