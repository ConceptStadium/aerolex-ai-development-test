# Aerolex AI Development Test

Static Astro, TypeScript and Tailwind website based on all nine page designs in [Aerolex Figma](https://www.figma.com/design/YWSo7zk37zCZjqXJZFcYLT/Aerolex-Website-Design). No React, database or deployment integration.

## Development

Use Node 22.23.4 (`nvm use`), then `npm ci`.

```sh
npm run dev -- --background
npm run astro -- dev status
npm run astro -- dev logs
npm run astro -- dev stop
npm run check
npm run build
npm run test:routes
npm run preview
```

The local development URL is http://localhost:4321. `build` first validates CMS content, then generates static files in `dist/`. `test:routes` requires a completed build and Python 3. CI runs TypeScript checks, validation, build and internal-link checks. It does not deploy.

## Pages

| Page | Route | Figma node |
|---|---|---|
| Home | `/` | 16:1561 |
| About | `/about/` | 3:2 |
| Consultancy | `/consultancy/` | 22:2675 |
| Safety and Compliance | `/safety-and-compliance/` | 22:2116 |
| Training | `/training/` | 26:2 |
| Training Detail | `/training/{slug}/` | 26:321 |
| Blog | `/blog/` | 11:479 |
| Blog Detail | `/blog/{slug}/` | 13:1481 |
| Contact | `/contact/` | 10:2 |

There are six course and six article entries reproducing the repeated listing cards in Figma. Detail pages use their respective Figma template. Each course has a `/training/{slug}/syllabus.txt` download generated from its JSON syllabus. This is a text export, not an original PDF supplied by the client. Three legal notice routes and a custom 404 page supplement the nine design layouts.

## Editing content

`src/content/` contains editable JSON:

- `home.json`, `about.json`, `consultancy.json`, `safety.json`, `contact.json`: page metadata and sections.
- `training.json`, `blog.json`: listing headings, imagery, filters and labels.
- `courses/*.json`: one course per file; shared detail template and automatic listing.
- `posts/*.json`: one article per file; shared detail template and automatic listing.
- `navigation.json`, `footer.json`, `ui.json`: shared links, contact information and interface labels.
- `legal/*.json`: explicit notices pending approved legal copy.

Create a course or article by duplicating an entry or using the corresponding Pages CMS collection. Set a unique lowercase hyphenated `slug`, YYYY-MM-DD `date`, numeric `order`, and boolean `draft`. `draft: true` hides the entry from listings and generated detail routes. Slug changes change URLs; update any explicit navigation links. Blog categories must match a category in `blog.json` after the first “All” item. Populate every field shown in the editor, including lists and image alt text. Use empty alt text only for decorative imagery.

Rich text is HTML, sanitized when rendered. Images live in `public/images/` and are referenced as `/images/name.ext`. Figma exports are under `public/images/figma/`; fonts are local in `public/fonts/`, with their license. Use unique filenames for uploads to avoid overwriting another page's imagery.

Reusable components are in `src/components/`, the shared layout in `src/layouts/`, validation/content imports in `src/lib/content.ts`, responsive styling in `src/styles/global.css`, and routes in `src/pages/`. Legacy starter content remains unused.

## Pages CMS — configuration prepared, connection pending

See [Pages CMS setup and editor guide](docs/PAGES-CMS-SETUP.md) for the repository plan, login steps and connected editing test.

`.pages.yml` maps ten JSON files and three collections, including nested objects/lists, rich text and image uploads. Configuration was reviewed against the official [content](https://pagescms.org/docs/configuration/content/), [fields](https://pagescms.org/docs/configuration/content/fields/) and [filename](https://pagescms.org/docs/configuration/content/filename/) documentation. `npm run validate` checks the JSON-to-field mapping, field types, image files, URL formats, dates, slugs, form fields and blog categories. Build-time Zod schemas add course/post/navigation validation.

After approval to create or push a repository:

1. Connect the intended GitHub repository and branch to Pages CMS with appropriate access.
2. Test editing a heading and rich-text section, uploading an image, and creating a course/article with a unique slug.
3. Test draft visibility and list ordering. Pull the committed JSON and image changes locally.
4. Run `npm run check`, `npm run build`, and `npm run test:routes`; inspect the resulting pages.

CMS edits commit to GitHub. The CMS is not claimed operational until this round trip succeeds. No remote repository, push or deployment was performed.

## Contact form

The form has required fields, email validation, length limits, whitespace checks, accessible labels and a truthful validation-only status. JavaScript prevents submission; without JavaScript the form is disabled. It does not send email or store messages.

Production delivery needs an approved server endpoint (for example on the existing Hetzner infrastructure), server-side validation, abuse/rate protection, an approved recipient and mail transport, and success/error handling. Keep mail credentials on the server. Replace the preview notice only after actual delivery has been tested. No service purchase or production configuration has been made.

## Design and launch limitations

All nine desktop frames were accessible; no separate mobile or tablet frames were found. Responsive layouts are adaptations of those desktop designs. The Figma source itself contains lorem ipsum, six repeated “Course Name” cards, duplicate blog titles, fictional team/sample contact information and inconsistent article/listing copy. These are preserved for design comparison, not represented as verified business content. Replace them with approved editorial content before launch. Social URLs and legal documents were not supplied: social icons are unlinked and legal routes explicitly state that approved policy content is missing.

Assets and content came from Figma rather than generated replacement imagery. Design inventory is in `docs/figma-inventory.json`. See `docs/QA.md` for checks and remaining browser verification. Static hosting can serve `dist/` in future; host/domain/deployment settings are intentionally unconfigured.
