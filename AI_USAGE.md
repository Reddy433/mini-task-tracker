# AI Usage

> **Live demo:** https://vennapusa.netlify.app
> **Repository:** https://github.com/Reddy433/mini-task-tracker

## 1. Which AI tools did you use?

Claude Code (Anthropic) — an agentic coding assistant — was used to scaffold and
build the project from the requirements brief.

## 2. What did you ask AI to help with?

- Choosing a stack that satisfies "Next.js + a backend + a database + Netlify deploy" within a ~2 hour budget.
- Scaffolding the Next.js (App Router) project structure.
- Writing the REST API route handlers, the persistence layer, validation, and the React UI.
- Producing the tests and this documentation.

## 3. Which parts of the code were AI-assisted?

Essentially all of the source was generated with AI assistance:

- `app/` — pages, layout, and the `api/tasks` route handlers.
- `components/` — `TaskForm`, `TaskList`/`TaskCard`, `FilterBar`.
- `lib/` — `types.ts`, `validation.ts`, `store.ts`, `api.ts`, `format.ts`.
- Config: `package.json`, `tsconfig.json`, `tailwind.config.ts`, `netlify.toml`, `vitest.config.ts`.
- Tests and the README/this file.

## 4. What did you manually change or verify?

- **Stack decision:** chose Netlify Blobs over a "create a task → refresh → it's gone" in-memory store, specifically so the *deployed* app actually persists without requiring a separate database account.
- **Security patch:** the initially generated `next@14.2.5` was flagged by `npm audit` for a security advisory; bumped to the latest patched 14.2.x (`14.2.35`) and re-audited. Remaining advisories are in dev/build-only tooling (e.g. PostCSS used by the test runner) and would require a Next 16 breaking upgrade, so they were consciously left and noted.
- **Persistence resilience:** added an in-memory fallback in `lib/store.ts` so a Netlify Blobs hiccup degrades gracefully instead of returning a 500.
- Verified the production build (`next build`) compiles with no type or lint errors.

## 5. How did you test the solution?

- **Unit tests** (`npm test`, Vitest) for the validation rules — 9 tests, all passing.
- **Manual end-to-end API testing** against a production build (`npm start`) with `curl`, covering every requirement:
  - create a valid task (201),
  - create with empty/whitespace title → rejected (400, "Title is required."),
  - list all tasks,
  - search by title (`?q=`),
  - mark completed via `PATCH` (and confirmed `updatedAt` changes),
  - filter by `?status=open` and `?status=completed`,
  - invalid status value → 400,
  - patch/delete a non-existent id → 404,
  - delete → 200 and list shrinks.
- Confirmed the home page renders (HTTP 200) from the built app.
- **Verified the live Netlify deployment** at https://vennapusa.netlify.app — created, listed, and deleted a task against the production API to confirm Netlify Blobs persistence works end-to-end in the deployed environment.

## 6. Did AI produce anything incorrect or risky?

- **Yes — an outdated dependency with a known CVE.** The first generated `package.json` pinned `next@14.2.5`, which `npm audit` flagged. This was caught and patched (see §4). Lesson: AI-suggested version pins can be stale and must be audited.
- The default approach toward an in-memory store would have made the deployed app *appear broken* on serverless cold starts (data vanishing between requests). This was identified and replaced with Netlify Blobs before shipping.
- Everything else was reviewed for correctness and verified to work via the tests and manual API checks above — nothing was copied without verification.

## 7. What would you improve if you had more time?

- **Proper SQL database integration with a cleaner architecture.** The current
  Netlify Blobs store keeps the whole task list in a single JSON document, which
  is simple but rewrites everything on each change. With more time I'd move to a
  real relational database (PostgreSQL via Supabase/Neon, or SQLite/Turso) using
  a typed query layer or ORM (e.g. Prisma/Drizzle), with row-level inserts and
  updates, indexes on `status`/`createdAt`, and a clear data-access/repository
  layer separating the API routes from persistence. This removes the
  read-modify-write race and scales to large lists.
- **More polished UI/UX** — refined visual design, smoother transitions and
  micro-interactions, toast notifications, optimistic create, dark mode, and a
  fully responsive, accessible component set.
- **Deeper API integration** — wire the existing server-side filter/search into
  the UI (debounced) instead of client-side filtering, add pagination/sorting,
  proper request/response typing end-to-end, and consistent error envelopes.
- Inline **edit** UI (the API already supports `PATCH` on title/description/priority/due date).
- Add integration tests for the API route handlers and component tests with Testing Library.
