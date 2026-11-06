# Local Directus experiment

## Open and edit

Open **local-cms/Launch Local CMS.command** in Finder (double-click). It starts local Directus, starts the Astro background preview, and watches for saved CMS edits. Leave its Terminal window open while editing. The launcher uses the project Node version through nvm when available, or Node from PATH.

- CMS: http://127.0.0.1:8055/admin
- Astro preview: http://localhost:4321 (use the URL Astro prints if that port is occupied)
- Login: see `local-cms/LOGIN.txt`. Credentials are private local files, excluded from Git.

In Directus, open Content and choose Home, About, Consultancy, Safety and compliance, Training listing, Blog listing, Contact, Footer, or Header and navigation. Labels show the section and field. Repeated sections open as item forms; no JSON/code editing is needed. Save using the checkmark in the upper right.

Training courses and Blog articles support creating, editing and deleting entries. Supply a unique lowercase URL slug, all required text, a date in YYYY-MM-DD format, and numeric display order. Enable Draft to hide an entry. Use image fields to upload/select local files and fill alternative text. Blog categories must match the Blog listing's filter names. Changing a slug changes the URL; update any manually entered links to it.

The first administrator login may display Directus's owner-registration/license prompt. “Remind Later” permits evaluation without sending owner details. No registration or terms acceptance has been performed on your behalf. This version's licensing must be assessed separately before any future commercial/production use; this setup is local evaluation only.

## Local content pipeline

Directus → local authenticated API → validated JSON → unchanged Astro components → local static build.

Existing Astro templates, routes and styles are unchanged. The original 25 JSON documents and referenced images were imported into 13 Directus collections. Singleton objects are shown as labeled fields; arrays use repeatable item forms. Uploaded image IDs are translated to local `/images/directus/` files. Seeded assets retain their original paths, preserving the initial design exactly. Inline rich-text images are not supported by the existing Astro renderer: use dedicated image fields.

`cms:watch` checks for changes every five seconds, exports only when content differs, backs up the current JSON, validates content, builds and checks internal links. Invalid data is rejected and the previous JSON/build restored; the invalid draft remains in Directus for correction. Read the Terminal error if a save does not appear. During a build the dev preview can briefly reload; the watch cycle is not an atomic multi-file publish.

Do not edit JSON independently while watch mode runs: Directus is the editing source for this experiment. Stop the watcher first if you need developer changes. Backups are in `local-cms/backups/`.

## Commands (from the Astro project)

```sh
nvm use
npm run cms:start
npm run cms:status
npm run cms:sync
npm run cms:watch
npm run cms:watch-start
npm run cms:watch-stop
npm run cms:stop
npm run astro -- dev stop
```

`cms:sync` performs one validated export/build. `cms:watch` keeps doing so until Ctrl+C. `cms:stop` stops only the Directus process launched by this project. Stop the foreground watcher with Ctrl+C, or the background watcher with `npm run cms:watch-stop`. The double-click launcher stops the background watcher before starting its foreground watcher. The existing Astro server is managed by Astro's background commands.

For dependency restoration: `npm ci --prefix local-cms --cache local-cms/.npm-cache`. Dependency downloads require network access, but runtime content/database access is local. Directus is pinned to 11.17.4, compatible with the existing Node 22 runtime, and has a separate package lock. The install reports upstream deprecations/peer warnings; this is not a production deployment.

## Isolation and storage

- Directus binds only `127.0.0.1:8055`.
- SQLite database: `local-cms/database/aerolex-local.sqlite`.
- Uploaded originals: `local-cms/uploads/`.
- Credentials: `local-cms/.env` and `local-cms/LOGIN.txt` (0600).
- Image-ID mapping/import state: `local-cms/state.json`.
- Runtime log: `local-cms/directus.log`.
- `offline-guard.mjs` blocks outbound TCP and fetch from the CMS process; only project-local Unix sockets are permitted for internal IPC.
- Telemetry, owner reporting, AI, MCP, marketplace and WebSockets are disabled. Browser content-security policy restricts network connections/assets to local/self sources, with data/blob assets where needed.
- Email points to an unusable loopback SMTP port and the outbound socket guard blocks delivery. No real emails are sent.
- No public content permissions have been granted; authentication is required.
- Existing Pages CMS configuration remains for reference, but the GitHub CMS workflow is paused. No pushes, deployment, DNS/hosting changes or WordPress access belong to this local workflow.

Preserve the database, uploads, state.json and .env together for a complete local CMS backup. JSON backups alone preserve website content, not Directus users or media metadata. Do not delete the local database to troubleshoot an import. `cms:seed` skips completed imports and does not overwrite edited collections.

## Verification

The initial Directus-to-JSON export matched all existing content without changes. Browser login and a reversible About heading edit were verified through the local build. `npm run cms:test` exercises temporary image upload, course/article creation, invalid-edit rollback, draft visibility and deletion; it restores original content afterward. Run tests with the watcher stopped and no concurrent editing.

The contact form remains validation-only. The live Aerolex website, WordPress installation and production/staging infrastructure are not used by this setup.

## Restoring another development machine

The repository contains tooling, not a ready-to-run CMS database. Restore the private `.env`, database, uploads and `state.json` together through an approved private backup process, or provision a fresh isolated instance separately. `LOGIN.txt` is local documentation only. Never commit or upload these files to frontend hosting. Installing dependencies alone does not restore the CMS.
