# Pages CMS setup and editor guide

## Repository readiness

The project is committed and pushed to the private repository https://github.com/ConceptStadium/aerolex-ai-development-test on `main`. Ownership was transferred from Levani1111 to ConceptStadium with approval, and the local `origin` remote points to the organization repository. Pages CMS sign-in, repository authorization and live editing tests remain pending. No deployment is configured.

`.gitignore` excludes dependencies, build output, Astro caches and local environment secrets. Public assets total approximately 5.2 MB; none exceeds 50 MB. GitHub Actions checks types, validates content, builds and tests local links only. WordPress is unchanged.

## Editing coverage

- Home: metadata, hero, statistics, services, process, feature and partners.
- About: hero, story, timeline, team, values and reach.
- Consultancy and Safety and Compliance: hero, service sections and feature.
- Training listing: metadata, hero, copy and labels.
- Training courses: create/edit/delete individual JSON entries, including syllabus, sections, dates, images, order and draft visibility.
- Blog listing: metadata, hero, category filters and labels.
- Blog articles: create/edit/delete individual JSON entries, including formatted body, image, category, dates, order and draft visibility.
- Contact: details, hero, form labels, options and preview notices.
- Navigation, footer, interface labels and existing legal notices are also editable.

All 25 website JSON documents match CMS field definitions. The additional `src/content/data/site.json` is unused starter data and is intentionally not exposed. Core page files and legal pages cannot be renamed/deleted in the CMS because the website imports or links to them. Courses/posts explicitly allow create, rename and delete; normal field editing is available throughout.

Images upload into `public/images/` and save `/images/...` references. Filenames are made URL-safe. Use unique filenames and meaningful alternative text. Image fields support uploads; rich-text bodies support formatting but currently do not allow embedded image uploads.

## Connection and login

1. Open https://app.pagescms.org and sign in with GitHub using an account with access to the intended repository.
2. Install the Pages CMS GitHub App on the account/organization that owns the repository. Choose Only select repositories and select this private test repository. An organization owner may need to approve installation.
3. Open the repository and intended editing branch (`main`).
4. Pages CMS should load the existing root `.pages.yml`; do not replace it with a generic starter. If prompted to create configuration, check the selected repository and branch.
5. Confirm all editor sections listed above appear. If the repository is absent, check the GitHub App's selected repositories and your account access.

Official documentation:
- https://pagescms.org/docs/quick-start/
- https://pagescms.org/docs/configuration/content/operations/
- https://pagescms.org/docs/configuration/media/

There is no local `/admin` page or separate CMS password. Hosted Pages CMS authenticates with GitHub. Do not add GitHub tokens to Astro source or public environment variables. CMS saves commit changes to GitHub; they do not update this local checkout or deploy the site automatically.

## First connected test

Use a test branch if available, or agree on temporary edits to the editing branch. Record original values before changing them.

1. Change Home → Hero section → Heading, save, and confirm the GitHub commit changes the expected JSON.
2. Upload an image through a course/article Image field. Check the file appears under `public/images/` and JSON uses `/images/...`.
3. Create a test course and article with unique slugs, all required copy, YYYY-MM-DD dates and numeric display order. Use a blog category matching Blog's filter list. Turn Draft off for the route test.
4. Edit each entry, save, then pull into a clean local checkout on that branch with `git pull --ff-only`. Reconcile any local changes before pulling.
5. Run `npm run check`, `npm run build`, and `npm run test:routes`. Run `npm ci` first if dependencies changed. Preview with `npm run preview` using its printed URL. Verify the heading, image, listings and detail pages.
6. Turn Draft on, save/pull/rebuild and verify the entries disappear from listings and generated URLs.
7. Delete the temporary entries in Pages CMS, restore the heading, save/pull/rebuild and check links. Remove the temporary image only when no content references it.

Deleting an entry removes its route on rebuild. Remove any manually added menu/footer links to it. The default Training dropdown links to the listing so it survives course deletion. Changing a slug changes its URL; redirects are not generated automatically.

## Local tests completed

- 25 CMS JSON documents and 56 image references validated.
- Homepage editing, course/article creation, a new image reference, and deletion of existing course/article entries passed build/link checks.
- Draft entries disappeared from listings and generated detail URLs.
- Original content was restored; final production build and route checks passed.
- TypeScript reported zero errors, warnings or hints across 32 files.

These are filesystem-to-build tests. Real GitHub authentication, CMS field serialization, uploads, saves and the pull/rebuild round trip remain pending connection. Contact email delivery remains unconfigured.
