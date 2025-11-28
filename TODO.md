## Bugs

- Incoming Mail: FWD: Lag noe logikk som sjekker om to-adresse er @kodemaker.no.
- Incoming Mail: FWD: insert crmUser hvis det ikke finnes og @kodemaker.no
- Ny kontakt: Ikke bruk legacy email!

## Features

- ? Hendelseslogg: Bør kanskje ha created by?
- Flere slette-knapper. Email, kommentar, lead, oppfølging, kunde
  v En kontakt må kunne ha flere eposter.

## PROD Deployment

- TODO Overføre repo til kodemaker.no
- TODO Lag konto på Scalingo for app og db
- TODO Lag kodemaker-konto på postmarkapp.com
- TODO Lag endelig deploy mot kodemaker rep og kodemaker secrets.

## Tech debt / refactoring

- TODO Konsolidere navigasjonslogikk i `Sidebar`, `MobileSidebar` og `SidebarSheetContent`.
  - Problem: Navigasjonslenker og “kontekst-fetching” (company/contact via SWR) er duplisert tre steder.
  - Forslag: Introduser en felles nav-konfig (array med `{ href, label, icon }`) og en hook `useCurrentContextHeader()` som kapsler SWR-kallene.
  - Gevinst: Mindre duplisering, enklere å legge til/endre menypunkter, færre feil mellom desktop og mobil.

- TODO Rydde opp i “ny organisasjon”-flyt (`CustomersPage` vs `NewCompanyDialog`).
  - Problem: `CustomersPage` har egen `companySchema` + `useForm` + `onSubmit` som overlapper `NewCompanyDialog`.
  - Forslag: Velg én sann kilde (trolig `NewCompanyDialog`) og fjern ubrukt/duplisert form-logikk i `CustomersPage`.
  - Gevinst: Mindre teknisk gjeld og mer forutsigbar oppførsel.

- TODO Justere UI-typer til å bruke `src/types/api.ts` som base.
  - Problem: Lokale typer (f.eks. `type Company` i `CustomersPage`) kan divergere fra `ApiCompany`.
  - Forslag: Innfør utvidelser som `type CompanyWithCounts = ApiCompany & { leadCounts?: ... }` i stedet for helt egne typer.
  - Gevinst: Sterkere sammenheng mellom API og frontend, tryggere refaktorering.

- TODO Samkjøre event-typer (entity) på tvers av DB, backend og frontend.
  - Problem: `eventEntityEnum` (DB), `EventEntity` i `src/db/events.ts` og `Event`-typen i `src/app/events/page.tsx` må manuelt holdes i sync.
  - Forslag: Definer en felles `EventEntity`/konstantkilde ett sted og importer den i API + UI.
  - Gevinst: Mindre risiko for staving/enum-avvik og runtime-feil.

- TODO Ekstrahere hook for å fullføre oppfølginger (PATCH + mutate).
  - Problem: `FollowupsList` gjør både fetching, visning og PATCH-kall mot `/api/followups/[id]`.
  - Forslag: Lag en hook (`useCompleteFollowup` / `useFollowups`) for mutasjonen, og la `FollowupsList` være ren presentasjon.
  - Gevinst: Bedre separasjon av ansvar og enklere gjenbruk av logikken.

- TODO Utvide `README.md` med korte end-to-end feature-flyter.
  - Problem: README beskriver stacken, men ikke konkrete flows for nye utviklere.
  - Forslag: Legg inn seksjoner som “Flyt: Opprett organisasjon”, “Flyt: Opprette lead”, “Flyt: Oppfølging + hendelser” med lenker til relevante filer.
  - Gevinst: Raskere onboarding (og lettere å komme tilbake etter pauser).
