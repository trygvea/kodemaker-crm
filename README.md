# About this project

This is a Next.js project bootstrapeed with `create-next-app` and modified to use a postgres database with drizzle.

It was created with Cursor in Agent mode with the gpt-5-high-fast model, and bootstrapped with the LLM prompt given later in this document. After that, there has been a lot of vibe coding, but also some manual coding.

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

### Manual db migration

Scalingo is set up to automatically run generated migrations when the app is deployed. If you want to manually migrate the database, you can do so by running the following command:

```bash
    URL="$(scalingo -a kodemaker-crm env-get SCALINGO_POSTGRESQL_URL)"
    scalingo -a kodemaker-crm env-set DATABASE_URL="$URL"
    scalingo -a kodemaker-crm run 'npx -y drizzle-kit migrate'
```

# LLM use

This project was created with Cursor in Agent mode with the gpt-5-high-fast model, and bootstrapped with the LLM prompt below. After that, there has been a lot of vibe coding, but also some manual coding.

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
