# AGENTS.md

Purpose

- Describe how autonomous/scripted agents (and human-in-the-loop) should interact with this codebase.
- Keep agents safe, fast, and consistent with our product conventions.

Core Principles

- Minimal diffs: prefer small, targeted edits and avoid broad reformatting.
- Types first: strong TypeScript types, Zod schemas for API I/O; dev-only validation where possible.
- Deterministic UX: avoid non-deterministic SSR/CSR behavior and hydration mismatches.
- Tests pass green: update tests when changing UX strings or flows.
- Accessibility: interactive elements must be reachable by keyboard and be semantic.

Project Overview

- Stack: Next.js (App Router), TypeScript, Drizzle ORM (Postgres), NextAuth, SWR, shadcn/ui, Tailwind.
- Realtime: Events via Postgres LISTEN/NOTIFY → SSE at `/api/events/stream`.
- Auth: Google OAuth via NextAuth; middleware redirects to `/login` when not authenticated.
- Database: Drizzle schema in `src/db/schema.ts`; queries in `src/db/*`.
- UI: Pages under `src/app`, reusable components under `src/components`.

File/Folder Conventions

- `src/app/api/**/route.ts`: Next.js API routes; validate input with Zod; return typed data; add rich events using `createEventWithContext`.
- `src/db/schema.ts`: single source of truth for DB schema.
- `src/db/events.ts`: use `createEventWithContext(entity, entityId, verb, { companyId?, contactId?, excerpt? })`.
- `src/types/api.ts`: exported response shapes; update when API changes.
- `__tests__/api` and `__tests__/ui` (if present): keep tests organized by layer.
- Strings: Norwegian product copy; use “Organisasjon/Organisasjoner” instead of “Kunde/Kunder”.

Agent Playbooks

1. Add or change an API route

- Add Zod schema for input.
- Implement logic with Drizzle; sort/order server-side.
- Return typed payload (conform to `src/types/api.ts`); add dev-only Zod validation if needed.
- Create rich event with `createEventWithContext`.
- Update or add tests in `__tests__/api`.
- If shape changes, update UI callers and types.

2. Modify a page layout

- Use card pattern: `border rounded p-4` sections; grid layout for two-column pages.
- Keep `PageBreadcrumbs` at the top.
- Avoid nested anchors; use button-like div + `router.push` for row clicks; inner anchor tags must `stopPropagation`.

3. Add follow-up capabilities

- API: `/api/followups` supports scoping with `?contactId|companyId|leadId` and `all=1`.
- Always return `createdBy`, `company`, `contact` where possible.
- UI: use `FollowupsList` and refresh SWR (`mutate`/`useSWRConfig`) after create/complete.
- Due date default: +1 week at 09:00.

4. Events page behavior

- SSE connects only after initial SWR load; highlight new events for 10s.
- Paused mode halts reconnections and list updates.

Coding Standards

- TypeScript: explicit function signatures on exported modules; avoid `any` outside tests.
- Errors: never swallow without context; return `NextResponse.json({ error }, { status })`.
- Styling: Tailwind utility classes; keep density consistent; use shadcn/ui components.
- Accessibility: ensure `role="button"`, `tabIndex={0}`, key handlers for Enter/Space on clickable divs.

Testing

- If user-facing text changes, update tests accordingly (e.g., “Organisasjoner”).
- API tests should mock NextResponse where necessary (see `jest.setup.ts`).
- Keep tests fast and hermetic; avoid real network/DB unless integration is explicit.

Migrations

- After schema changes:
  - `npm run db:generate-migrations`
  - Commit migration files.
  - `npm run db:migrate` locally.
  - Scalingo will run checked-in migrations on deploy.

Performance & Realtime

- SSE only for events; debounce reconnects (2s) on error.
- Prefer server sorting and pagination/limits (e.g., latest 100/200).

Common Pitfalls (and fixes)

- Hydration mismatch: avoid nested anchors; avoid non-deterministic SSR (Date.now(), random) without hydration guards.
- Route changes must update breadcrumbs and sidebar labels.
- Use `useSWRConfig().mutate(key)` to revalidate shared lists after POST/PATCH/DELETE.

Security

- Only allow `@kodemaker.no` Google accounts.
- Validate all external payloads (Postmark inbound, forms) with Zod.
- Never log secrets; redact email bodies where necessary.

How to Propose Changes

- Make small edits; run tests.
- If changing product copy, search and update tests/UX consistently.
- For broad design updates, refactor one page first, then replicate pattern.

CI Expectations

- `npm test` passes.
- Lint passes with zero warnings.
- No TypeScript errors in app code; tests can relax strictness via `tsconfig.jest.json`.

Contacts

- Product/Design: Trygve
- Codeowners for DB/Events: see `src/db/*`
