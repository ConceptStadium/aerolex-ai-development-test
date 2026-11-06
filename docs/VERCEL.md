# Vercel frontend preparation

The private repository remains ConceptStadium/aerolex-ai-development-test. No Vercel project has been linked or deployed by this preparation.

## Build settings

- Root directory: repository root
- Framework: Astro (static)
- Install: `npm ci`
- Build: `npm run build` (includes JSON and image validation)
- Output: `dist`
- Node: select 22.x, compatible with `.nvmrc`; do not rely on the broad package engines range to select the major version.
- No frontend environment variables or Directus credentials are required.

`vercel.json` records the build settings. `.vercelignore` excludes the entire local CMS and environment files from frontend uploads. Git separately excludes credentials, databases, uploads, logs, backups and local Vercel metadata. Only static `dist` output is served; the Directus package is never installed or started by the root build. No Astro server adapter is needed.

## Account gate (checked 6 November 2026)

Team `cs-ddd5` displays Hobby. Hobby does not support private GitHub organisation repositories and is restricted to personal non-commercial use. This project remains an internal agency experiment. Do not deploy on Hobby or treat CLI/personal repository copies as an exemption.

The dashboard offers a Pro trial. This is a possible temporary evaluation path subject to Vercel eligibility and trial conditions, not an activated plan or a permanent free hosting solution. Paid Pro/Enterprise supports commercial use but requires separate approval. No trial or paid upgrade has been activated.

References:
- https://vercel.com/docs/git#using-hobby-teams
- https://vercel.com/docs/limits/fair-use-guidelines#commercial-usage
- https://vercel.com/docs/plans/pro-plan/trials
- https://vercel.com/docs/frameworks/frontend/astro

## After an approved compatible plan is available

Authorize the Vercel GitHub app for only the intended repository, import it into the approved team, select Node 22.x and review the settings above. Deploy only after approval; use a Vercel preview hostname without changing production DNS. Git integration can then deploy main and preview branches automatically. Check all routes, assets and responsive layouts on the deployed URL. The existing GitHub Actions workflow validates and builds only.

Directus remains separate and local. It exports validated JSON and images; reviewed source changes must be committed and pushed to update a future frontend deployment. There is no hosted CMS connection or automatic CMS webhook. The contact form remains validation-only and does not send email.
