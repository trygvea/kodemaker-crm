# About this project

This is a Next.js project bootstrapped with `create-next-app` and wired to PostgreSQL via Drizzle ORM.

It was created with Cursor in Agent mode with the gpt-5-high-fast model, and bootstrapped with the LLM prompt given later in this document. After that, there has been a lot of vibe coding, but also some manual coding.

## Features

- Hendelseslogg (Events) with live updates via Server‑Sent Events (SSE)
  - Page: `/events` (default route from `/`)
  - Pause/resume toggle; new events animate (10s) on arrival
  - Backfilled delivery on reconnect using `?since=`
- Contacts
  - New search page `/contacts` with incremental search (from first character)
  - De‑duplicated list (unique contacts even with multiple company histories)
  - Contact email addresses are modeled in `contact_emails`; lists concatenate addresses
  - Contact detail page: comments, open followups, leads, emails; “Endre” button to edit
  - Contact edit page: update fields, manage email addresses, and company affiliations with searchable picker
- Companies
  - Company detail page: comments, contacts, leads; “Endre” button to edit
  - Company edit page: update name, website, email domain, contact email
- Leads
  - Active leads show `createdAt`; lists sorted reverse‑chronologically where relevant
- Emails
  - Inbound email parsing from Postmark (BCC and forwarded)
  - Subjects are stored; names derived from email local‑part with proper capitalization
- Event logging
  - Inserts into `events` on create/update for contacts, companies, leads, comments, emails, followups

## Getting Started

First, start the database:

```bash
npm run db:up
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Environment variables

Create a `.env.local` with (examples):

```
DATABASE_URL=postgres://postgres:postgres@localhost:5432/crm3

NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=dev-secret-change

# Google OAuth (if enabled)
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...

# Postmark inbound webhook (optional signature verification)
POSTMARK_WEBHOOK_SECRET=...
```

### Database migrations

If you change any database schema, you must remember to generate migrations.
The workflow is to first create a new migration, then check it in to git, and then apply it.

Run the following command to create a new migration:

```bash
npm run db:generate-migrations
```

Run the following command to apply the migration:

```bash
npm run db:migrate
```

On Scalingo, checked in migrations will be run automatically when the app is deployed.

Note: If you add/alter enums, ensure migrations do not recreate an existing enum (common Postgres gotcha).

### Real‑time Events (SSE)

- Server endpoint: `GET /api/events/stream` (dynamic; uses Postgres LISTEN/NOTIFY)
- Initial list: `GET /api/events` (returns latest 200)
- Client: `src/app/events/page.tsx` subscribes after initial SWR load to avoid animating initial items.

### API overview (selected)

- `GET /api/events` — latest events
- `GET /api/events/stream?since=<id>` — live stream via SSE
- `POST /api/comments` — add comment (company/contact/lead)
- `POST /api/followups` — add followup (uses `z.coerce.date()` for `datetime-local`)
- `PATCH /api/followups/:id` — mark completed
- `GET /api/contacts` — list/search (top 100 or top 200 on search; unique by contact)
- `GET /api/contacts/:id` — contact details (sorted lists)
- `PATCH /api/contacts/:id` — update contact
- `POST /api/contacts/:id/emails` — add email address for a contact
- `PATCH /api/contacts/:id/emails/:emailId` — update email address (email/active)
- `DELETE /api/contacts/:id/emails/:emailId` — delete email address
- `POST /api/contacts/:id/merge` — merge a contact into another
- `GET /api/companies/:id` — company details
- `PATCH /api/companies/:id` — update company
- `POST /api/emails` — inbound email (Postmark) parsing and persistence

## Deployment

The app is deployed to Scalingo, and the database is deployed to Scalingo Postgres.
Login is handled by NextAuth with Google login.
Inbound email is handled by Postmark Inbound Email that feeds the `/api/emails` route.

TODO Currently, Trygve has set up Scalingo, Google login, Postmark on his account. We need to transfer these to Kodemaker.

### Email inbound

Use 4bd2bba8259b7bf7fda7a600175ce1b3@inbound.postmarkapp.com as the crm email address.

There are many ways to send emails to the crm app.

- When sending an email to a contact, we add the app as BCC. (supported)
- After receiving an email from a contact, we (later) FORWARD the email to the app. (supported)
- After sending an email to a contact, we (later) FORWARD the email to the app. (NOT YET SUPPORTED)

Subjects are stored. When creating a contact from an email address, the local‑part is used to derive first/last name (handles dots, hyphens, plus‑tags) and capitalization.

### Manual db migration

Scalingo is set up to automatically run generated migrations when the app is deployed. If you want to manually migrate the database, you can do so by running the following command:

```bash
    URL="$(scalingo -a kodemaker-crm env-get SCALINGO_POSTGRESQL_URL)"
    scalingo -a kodemaker-crm env-set DATABASE_URL="$URL"
    scalingo -a kodemaker-crm run 'npx -y drizzle-kit migrate'
```

## Testing

Jest + Testing Library are configured.

```
npm test
```

Highlights:

- Unit tests for email parsing and name derivation
- API tests for contacts de‑dup, contact merge, and company updates
- Events test for Postgres NOTIFY path
- UI tests for `/events` highlight lifecycle and `/contacts` navigation

# LLM use

This project was created with Cursor in Agent mode with the gpt-5-high-fast model, and bootstrapped with the LLM prompt below. After that, there has been a lot of vibe coding, but also some manual coding.

The [AGENTS.md](AGENTS.md) is generated and should be kept updated. It gives a great overview of the project, its techstack, and how to interact with it.

## Initial prompt

### Techstack

Techstack: Bruk next.js, Typescript, Postgres, drizzle, NextAuth, Tailwind, shadcn/ui, jest.
Sett opp postgres i docker-compose, og lag opplegg for migrering.
Bruk SWR for spørringer og muteringer.

### Domain description

(By Kolbjørn)

Ønsker å få laget et eget veldig enkelt CRM system for konsulentselskap innen systemutvikling.

Egenskaper.
Brukere - Mennesker med fornavn, etternavn, epost, telefon
Det må kunne lages nye brukere med passord.
Rettigheter kan være admin eller vanlig bruker.

Kontakter - Mennesker med fornavn, etternavn, epost, telefon, LinkedIn-profil og firma
Kontakter vil ha en historikk med firmaer, og vil være knyttet til dette for en periode. Eventuelt ingen firmaknytning.

Firma - Firmanavn, webadresse, e-post-domene, kontakt-e-post
Firma kan ha mange kontakter knyttet til seg for gitte perioder.

Leads - En konkret mulighet for salg.
Knyttet til et firma eller en kontakt må det kunne lages ‘leads’
Leads skal inneholde firma, (evt. kontakt), pluss en beskrivelse
Leads må ha en status: Ny, Under arbeid, Tapt eller Vunnet

Kommentarer - Fri tekst
Knyttet til firma alene
Knyttet til kontakt, og da også firma hvis kontakten tilhører et firma i gitt periode.
Knyttet til leads

Email - Innhold
Knyttet til mottaker (som kan være kontakt eller firma).
Email skal kunne videresendes til en e-post-adresse, tolkes og knyttes til kontakt i CRM-systemet. Hvis kontakten finnes kobles epost til denne, og hvis ikke opprettes en ny kontakt. Skal også spores hvilken bruker som sendte epost til systemet.
Email skal kunne sendes som BCC til systemet når bruker sender epost til en kontakt. Hvis kontakten finnes kobles epost til denne, og hvis ikke opprettes en ny kontakt.
Oppfølging
Brukere skal kunne lage oppfølging knyttet til kontakter, firmaer eller leads fram i tid.
Oppfølginger må vises for den enkelte bruker som laget den.
Administrator må kunne se alle oppfølginger.
