<!-- b8aeab67-b60f-49f4-91cd-a0768c09bf02 f2f761d7-7afc-4770-a1f7-17fd336dda40 -->
# Plan for å bytte til pnpm og gjøre kodemaker-crm mer robust mot Shai Hulud-lignende angrep

**Premisser**

- Vi har allerede en «minimal npm»-plan lagret; denne nye planen er et alternativ der vi **bytter fra npm til pnpm** og utnytter tiltakene beskrevet i [kode24-innlegget om Shai Hulud 2.0](https://www.kode24.no/artikkel/ga-beskjed-til-70-utviklere-etter-shai-hulud-20-stopp-alt/250482) og bakgrunnsartikkelen (`https://www.kode24.no/artikkel/digert-angrep-shai-hulud-stjeler-hemmelighetene-dine/250162`).
- Mål: mer forutsigbar dependency-graf, innebygget «karantenetid» for nye pakker, og bedre beredskap ved nytt supply-chain-angrep.

### 1. Migrere prosjektet fra npm til pnpm (uten å endre runtime-stack)

- **Installere og konfigurere pnpm i prosjektet**:
- Legge til `packageManager`-felt i `package.json` (f.eks. `"packageManager": "pnpm@X.Y.Z"`).
- Generere `pnpm-lock.yaml` fra eksisterende `package-lock.json` / `package.json` og sjekke den inn.
- **Oppdatere scripts og dokumentasjon til å bruke `pnpm`** i stedet for `npm`:
- Bytte alle lokale kommandoer i `README.md`/`CONTRIBUTING.md` (install, dev, test, build) til `pnpm`-ekvivalenter.
- Dokumentere kort hvordan utviklere som fortsatt har npm som default kan bruke `pnpm dlx pnpm` eller global pnpm.

### 2. Konfigurere pnpm-workspace for karantenetid og streng dependency-graf

- **Opprette/oppdatere `pnpm-workspace.yaml`** for repoet:
- Definere hvilke mapper som er en del av workspacen (typisk root + eventuelle pakker hvis monorepo).
- Sette `minimumReleaseAge` (f.eks. 10080 minutter ≈ 7 dager) slik artikkelen anbefaler, så nye pakkeversjoner må ha «ligget» en stund før de kan installeres.
- **Stramme inn versjonering i `package.json`**:
- Fjerne `^` og `~` der det er hensiktsmessig og bruke eksakte versjoner for de viktigste runtime-avhengighetene (Next.js, Drizzle, NextAuth, Zod, osv.).
- La pnpm og lockfila være single source of truth; alle endringer i dependencies skjer via `pnpm add` og commit av både `package.json` og `pnpm-lock.yaml`.

### 3. Hardene CI (GitHub Actions) til pnpm + Shai Hulud-tiltak

- **Oppdatere `.github/workflows/node.js.yml` til å bruke pnpm**:
- Legge til `pnpm`-install i workflow (enten via `corepack enable` eller dedikert setup-action) og bytte fra `npm ci` til `pnpm install --frozen-lockfile`.
- Aktivere pnpm-cache via `actions/setup-node` eller dedikert cache-step.
- **Kombinere pnpm med angreps-tiltak fra artikkelen**:
- Sikre at `minimumReleaseAge` respekteres i CI (pnpm gjør dette automatisk når konfigurert).
- Legge inn mulighet for å kjøre med `pnpm install --ignore-scripts` som en «incident mode» (styrt via `workflow_dispatch` input eller env-var), for å stanse pre/postinstall-scripts ved akutt hendelse.

### 4. Lokal utviklerflyt med pnpm og «emergency mode»

- **Oppdatere dokumentasjon for lokal utvikling**:
- Standardkommando for å sette opp prosjektet: `pnpm install` (som bruker lockfila).
- Beskrive hvordan man jobber videre under et pågående supply-chain-angrep:
- Ikke oppdatere dependencies; hold deg til eksisterende lockfil.
- Alternativt legge til/aktivere en `.npmrc`/`.pnpmrc`-variant med `ignore-scripts=true` hvis det er mistanke om ondsinnede scripts.
- **Legge inn en eksplisitt «beredskaps-oppskrift» for utviklere** inspirert av artikkelen:
- «Stopp alt mot Node», frys CI-deploy, og bruk eksisterende `pnpm-lock.yaml`.
- Sjekkliste for når det er trygt å begynne å oppgradere pakker igjen (f.eks. når min. alder er > tidspunktet for angrepet).

### 5. Secrets og registry-kontroll (lett versjon)

- **Gjøre en lett gjennomgang av GitHub Actions-workflow og Scalingo-oppsett slik det vises i repoet**:
- Sjekke at hemmeligheter med høy verdi ikke er tilgjengelig i steg som kjører `pnpm install`.
- **Forberede, men ikke nødvendigvis implementere nå, muligheten for privat registry/artifact-feed**:
- Kort notat i docs/issue om at neste steg mot maksimal robusthet er å bruke privat registry som upstream-cache (som Twoday gjør i artikkelen), slik at man raskt kan «bryte» mot public npm ved neste Shai Hulud.

### 6. Rydde opp i gammel npm-artefakter og verifisere

- **Rydde vekk ren npm-spesifikk konfig som ikke lenger trengs**:
- F.eks. npm-cache-innstillinger i workflow eller dokumentasjon som peker på `npm ci`.
- **Verifisere migrasjonen**:
- Kjøre hele løypa lokalt med pnpm (lint, typecheck, build, test).
- Verifisere at GitHub Actions med pnpm går grønt på både Node 20.x og 22.x.

### To-dos

- [ ] Legge til pnpm i prosjektet (packageManager-felt, generere og sjekke inn `pnpm-lock.yaml`, oppdatere basis-dokumentasjon til å bruke pnpm-kommandoer).
- [ ] Opprette/oppdatere `pnpm-workspace.yaml` med `minimumReleaseAge` og relevante workspaces, samt stramme inn viktige dependency-versjoner i `package.json`.
- [ ] Oppdatere `.github/workflows/node.js.yml` til å bruke pnpm (`pnpm install --frozen-lockfile`), med cache og mulighet for «incident mode» (`--ignore-scripts`).
- [ ] Oppdatere README/CONTRIBUTING med ny pnpm-basert utviklerflyt og en konkret beredskaps-oppskrift ved supply-chain-angrep.
- [ ] Kort gjennomgang av secrets i CI i forhold til pnpm-install-steg, og legge inn notat om eventuell fremtidig privat registry/artifact-feed.
- [ ] Rydde bort utdatert npm-spesifikk konfig/dokumentasjon og verifisere at hele bygget (lint, typecheck, build, test) fungerer med pnpm lokalt og i CI.