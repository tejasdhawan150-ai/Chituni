# DreamJobResume

**Turn Any Job Description Into Your Dream Resume.**

A free, simple website: add your resume, paste a job description, download a resume tailored to that job. No sign-up, no database.

## How it works for users
1. **Add your resume:** upload a PDF/Word file, paste the text, or try the sample.
2. **Paste the job description** from LinkedIn, Naukri, Indeed or any careers page.
3. **Tailor My Resume:** see the match score before → after, what was improved, and skills the job wants that weren't found. Pick a style (Classic, Modern, Executive, Minimal), edit any text, and download as PDF or Word.

The user's latest resume is kept in their own browser (localStorage). The server stores nothing.

## Run locally
```bash
npm install
npm run dev   # http://localhost:3000
```

## AI: free by default
- **No key (default, ₹0):** a built-in rule-based engine reads resumes, detects skills, strengthens bullet points and rewrites the summary.
- **Optional OpenAI key:** set `OPENAI_API_KEY` for better resume reading and rewriting. Each tailoring costs roughly ₹0.5 with `gpt-4.1-mini`. If the AI fails, the site falls back to the built-in engine automatically.

The AI never invents experience: `src/lib/ai/guardrails.ts` blocks any output that adds numbers, names or skills that aren't in the user's resume. Missing skills are shown to the user, never added.

## Deploying to Vercel
1. Import the GitHub repo on vercel.com/new. `vercel.json` already pins the Next.js settings.
2. The **Production Branch** (Settings → Git) should be `main`.
3. No environment variables are needed. Optionally add `OPENAI_API_KEY`.

## Code map
```
src/app/(marketing)          landing page, /build tool page, SEO pages, MBA guides, privacy/terms
src/app/api/resume/parse     PDF/Word/text → structured resume
src/app/api/resume/tailor    resume + job description → match score + tailored resume
src/app/api/resume/export    resume → PDF or Word download
src/components/build         the one-page resume tool
src/lib/ai                   AI providers (OpenAI + free built-in), prompts, guardrails
src/lib/ats                  skill detection and match scoring
src/lib/resume               resume schema, 4 designs, PDF/Word renderers
```

## Scripts
`npm run dev` · `npm run build` · `npm run lint` · `npm run typecheck` · `npm test`
