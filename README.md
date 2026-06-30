# Mini Task Tracker

A small but fully usable task tracker: create tasks, mark them complete, and
filter or search your list. Built with Next.js (App Router) and deployed on
Netlify with server-side persistence via Netlify Blobs.

> **Live demo:** https://vennapusa.netlify.app
> **Repository:** https://github.com/Reddy433/mini-task-tracker

## Project overview

The app lets a single user:

1. **Create** a task (title required, optional description, priority, due date).
2. **View** all tasks as cards showing title, description, status, and created date.
3. **Complete** a task with a checkbox — completed tasks are visually dimmed and struck through.
4. **Filter** by status: All / Open / Completed (each with a live count).
5. **Search** tasks by title.

Bonus features included: **delete task**, **priority** (low/medium/high),
**due date**, and a **task count summary** on the filter tabs.

### Data model

Each task (`lib/types.ts`):

| Field         | Type                          | Notes                          |
| ------------- | ----------------------------- | ------------------------------ |
| `id`          | `string` (UUID)               | server-generated               |
| `title`       | `string`                      | required, non-empty            |
| `description` | `string`                      | optional                       |
| `status`      | `"open" \| "completed"`       | defaults to `open`             |
| `priority`    | `"low" \| "medium" \| "high"` | optional                       |
| `dueDate`     | `string \| null` (ISO date)   | optional                       |
| `createdAt`   | `string` (ISO datetime)       | server-generated               |
| `updatedAt`   | `string` (ISO datetime)       | bumped on every update         |

## Tech stack

- **Framework / frontend:** Next.js 14 (App Router), React 18, TypeScript
- **Backend:** Next.js Route Handlers (Node.js) under `app/api/tasks` — a small REST API
- **Database / persistence:**
  - **Production (Netlify):** [Netlify Blobs](https://docs.netlify.com/blobs/overview/) — a built-in key/value store, no extra account or config required.
  - **Local dev:** a JSON file at `.data/tasks.json` (auto-created, git-ignored).
  - The two are swapped behind a single interface in `lib/store.ts`.
- **Styling:** Tailwind CSS
- **Tests:** Vitest
- **Deploy:** Netlify (`@netlify/plugin-nextjs`)

### Architecture

```
app/
  page.tsx              UI orchestration (state, optimistic updates)
  api/tasks/route.ts        GET (list + filter/search), POST (create)
  api/tasks/[id]/route.ts   GET, PATCH (complete/edit), DELETE
components/             Presentational components (form, list, card, filter bar)
lib/
  types.ts              Shared domain types
  validation.ts         Request validation (+ unit tested)
  store.ts              Persistence layer (Netlify Blobs / local file)
  api.ts                Typed client wrapper around fetch
  format.ts             Date formatting
```

UI and data logic are cleanly separated: components never call `fetch`
directly — they go through `lib/api.ts`, and the server never trusts client
input — it re-validates in `lib/validation.ts`.

### API design

| Method   | Path              | Purpose                                  |
| -------- | ----------------- | ---------------------------------------- |
| `GET`    | `/api/tasks`      | List tasks; supports `?status=` & `?q=`  |
| `POST`   | `/api/tasks`      | Create a task (validated)                |
| `GET`    | `/api/tasks/:id`  | Fetch one task                           |
| `PATCH`  | `/api/tasks/:id`  | Update fields (status, title, etc.)      |
| `DELETE` | `/api/tasks/:id`  | Delete a task                            |

Errors return a consistent `{ "errors": string[] }` body with an appropriate
HTTP status (400 / 404).

#### Live examples

The deployed API is browsable directly (base URL: `https://vennapusa.netlify.app`):

| What | URL |
| ---- | --- |
| All tasks | https://vennapusa.netlify.app/api/tasks |
| Only completed | https://vennapusa.netlify.app/api/tasks?status=completed |
| Only open | https://vennapusa.netlify.app/api/tasks?status=open |
| Search by title | https://vennapusa.netlify.app/api/tasks?q=gym |
| Filter + search combined | https://vennapusa.netlify.app/api/tasks?status=completed&q=gym |

Create / update / delete (via `curl`):

```bash
BASE=https://vennapusa.netlify.app

# Create a task
curl -X POST $BASE/api/tasks \
  -H 'Content-Type: application/json' \
  -d '{"title":"Buy groceries","description":"Milk and eggs","priority":"low"}'

# Mark a task completed (use an id from GET /api/tasks)
curl -X PATCH $BASE/api/tasks/<id> \
  -H 'Content-Type: application/json' \
  -d '{"status":"completed"}'

# Delete a task
curl -X DELETE $BASE/api/tasks/<id>
```

## How to run locally

Requires **Node.js 18.17+** (developed on Node 20).

```bash
npm install
npm run dev
# open http://localhost:3000
```

Tasks are stored in `.data/tasks.json` locally. Delete that file to reset.

Production build:

```bash
npm run build
npm start
```

## How to run tests

```bash
npm test
```

Unit tests cover the validation rules (title required / non-empty / length,
priority validity, input normalisation) in `lib/validation.test.ts`.

## Deployment (Netlify)

1. Push this repo to GitHub.
2. In Netlify: **Add new site → Import an existing project** and pick the repo.
3. Netlify auto-detects Next.js. Settings are already in `netlify.toml`
   (build command `npm run build`, `@netlify/plugin-nextjs`). Just click **Deploy**.
4. Netlify Blobs is enabled automatically — no environment variables or external
   database to configure.

## Known limitations

- **Single user, no auth.** Anyone with the URL shares the same task list (by design — auth was explicitly out of scope).
- **No pagination.** The full list is loaded once; fine for hundreds of tasks, not tens of thousands.
- **Search is title-only** and case-insensitive substring matching (per the spec).
- **Concurrency:** the store reads-modifies-writes a single JSON document. Simultaneous writes from different clients could race; acceptable for a single-user tracker, not for high concurrency.
- **Local dev persistence** uses a file; serverless environments other than Netlify would need a different backend wired into `lib/store.ts`.

## What I'd improve with more time

- Swap the single-document store for a real database (Postgres/Supabase/Turso) with row-level updates to remove the write-race.
- Inline **edit** UI (the API already supports `PATCH` on title/description/priority/due date).
- Optimistic-UI for create, plus toast notifications on errors.
- Server-side filtering/search wired into the UI (the API already supports it) with debounced requests, for very large lists.
- Sorting controls (by due date / priority) and overdue highlighting.
- Component/integration tests with Testing Library and an API route test harness.

## Approximate time spent

~2 hours (design, implementation, tests, manual API verification, docs).
