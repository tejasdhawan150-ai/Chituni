# DreamJobResume

**Turn Any Job Description Into Your Dream Resume.**
Paste a job description. Get an ATS-optimized resume built for the role.

A free resume builder for MBA graduates and early-career professionals (0–7 years). The user pastes a job description; the app analyzes the role, compares it with the user's real profile, and produces a tailored, ATS-friendly resume with a before/after match score.

## Quick start

```bash
npm install
cp .env.example .env.local   # optional: the app runs without any keys
npm run dev                  # http://localhost:3000
```

With no environment variables the app runs in **demo mode**:
- There's an in-memory database seeded with a fictional MBA profile, 4 resumes and a job tracker.
- A deterministic heuristic engine stands in for the LLM.

Add keys to switch on each real service.

| Capability | Env vars | Without them |
|---|---|---|
| Auth + Postgres (Supabase) | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Demo mode (in-memory data) |
| AI (OpenAI) | `OPENAI_API_KEY`, `OPENAI_MODEL`, `AI_PROVIDER` | Heuristic engine (no network) |
| Fair-use limit | `AI_DAILY_LIMIT` (default 100 AI actions per user per day, `0` = off) | — |

### Supabase setup
1. Create a project and run `supabase/migrations/20260928000000_init.sql`. It creates the tables, Row Level Security policies and a new-user trigger.
2. Enable the **Email** and **Google** auth providers.
3. Add `{SITE_URL}/auth/callback` to the allowed redirect URLs.

## Scripts
`npm run dev` · `npm run build` · `npm run lint` · `npm run typecheck` · `npm test`

## Architecture

```
src/
  app/(marketing)     landing, templates, programmatic SEO pages, MBA guides
  app/(auth)          login / signup (Google + email/password)
  app/(app)           dashboard, tailor flow, resume library, job tracker, cover letters, LinkedIn
  app/(editor)        full-screen resume editor
  app/api             PDF/DOCX export
  server/actions      server actions (auth + fair-use checks + Zod validation)
  lib/ai              provider interface, OpenAI + heuristic providers, prompts, guardrails, engine
  lib/ats             skills taxonomy, JD extraction, deterministic ATS scoring
  lib/resume          domain schema, 13 template configs, PDF + DOCX renderers, file text extraction
  lib/db              Repository interface, Supabase + in-memory implementations
  lib/auth            auth boundary (getCurrentUser / requireUser)
  lib/usage.ts        daily fair-use limit on AI actions
  config              site, MBA specialization guides
supabase/migrations   Postgres schema with RLS
```

**Swappable providers.** Each external service sits behind an interface:
- AI: `AIProvider` in `lib/ai/provider.ts`
- Database: `Repository` in `lib/db/types.ts`
- Auth: `lib/auth`

To add Anthropic or another provider, implement its interface and register it.

**Truthfulness is enforced in code, not just in prompts.** `lib/ai/guardrails.ts` checks every provider's output against the user's profile:
- Rewrites that introduce numbers or proper nouns not in the profile are discarded.
- Skills the profile doesn't show are moved to "missing". The UI shows: *"Missing skill — consider adding this only if you genuinely have experience with it."*
- Recommendations that target experience entries that don't exist are dropped.
- Users approve each bullet rewrite before it's applied.

**ATS scoring is deterministic** (`lib/ats/score.ts`). It gives a weighted score across five areas: keywords 30%, experience relevance 25%, skills 25%, formatting 10%, education 10%. Because it's deterministic, the score is reproducible and updates live in the editor. It is labelled everywhere as an internal estimate, not a guarantee.

**Free for everyone.** Every feature is available to every user. The only limit is a daily fair-use cap on AI actions (`AI_DAILY_LIMIT`) so one account can't run up the AI bill.

**SEO.**
- 10 intent pages, e.g. `/ai-resume-builder`, `/ats-resume-checker`, `/cv-builder-india`
- 10 role pages under `/resume-builder/[slug]`
- 9 guides under `/mba-resume/[specialization]`
- All are statically generated with metadata, canonical URLs, FAQ and breadcrumb JSON-LD, plus `sitemap.xml` and `robots.txt`.

**Job URLs.** The MVP works only from pasted job-description text. Job URLs are stored for reference and never fetched, because LinkedIn and other boards aren't scraped.

## Security notes
- API keys are read only in server code (`server-only` imports). Only `NEXT_PUBLIC_*` values reach the browser.
- Every table has Row Level Security; users can only read and write their own rows.
- Uploaded resumes are checked by magic bytes, limited to 5 MB and parsed in memory. They are never stored.
- The auth callback only allows same-origin redirects.
- The privacy policy and terms are templates. Have them reviewed before launch.
