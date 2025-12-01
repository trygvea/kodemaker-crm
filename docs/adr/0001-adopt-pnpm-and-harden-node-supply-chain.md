# ADR 0001: Adopt pnpm and harden Node supply chain

- Status: Accepted
- Date: 2025-12-01
- Decision makers: Kodemaker CRM-teamet
- Related discussions:
  - kode24: "Ga beskjed til 70 utviklere etter Shai Hulud 2.0: «Stopp alt»" (https://www.kode24.no/artikkel/ga-beskjed-til-70-utviklere-etter-shai-hulud-20-stopp-alt/250482)
  - kode24: "Digert angrep: Shai-Hulud stjeler hemmelighetene dine" (https://www.kode24.no/artikkel/digert-angrep-shai-hulud-stjeler-hemmelighetene-dine/250162)

## Context

Prosjektet `kodemaker-crm` kjører på Node/Next.js og er avhengig av npm-økosystemet. Shai Hulud-angrepet viste at:

- npm/Node er en kritisk del av infrastrukturen (ikke bare «frontend»).
- Supply-chain-angrep kan skje svært tidlig i livsløpet (preinstall-scripts, kompromitterte publiseringer), før vanlige sikkerhetsmekanismer rekker å reagere.
- Mange miljøer har «flytende» dependency-grafer (versjonsranges, implicit oppgradering i CI), noe som gjør det vanskelig å stoppe skade og rulle tilbake.

Historisk har dette prosjektet brukt `npm` med `package-lock.json`. Vi ønsket:

- Mer deterministiske bygg.
- Mulighet til å innføre karantenetid på nye pakkeversjoner.
- En tydelig, dokumentert beredskapsprosedyre når neste supply-chain-hendelse kommer.

## Decision

1. **Bytter fra npm til pnpm som package manager**
   - Legger til `"packageManager": "pnpm@9.15.4"` i `package.json`.
   - Bruker `pnpm-lock.yaml` som lockfil og lar pnpm være single source of truth for dependency-grafen.

2. **Innfører streng dependency-graf**
   - Alle `dependencies` og `devDependencies` i `package.json` bruker eksplisitte versjoner (ingen `^`/`~`).
   - Lockfil (`pnpm-lock.yaml`) er alltid sjekket inn og må oppdateres bevisst via `pnpm add` / `pnpm update`.

3. **Konfigurerer pnpm-workspace med karantenetid**
   - Oppretter `pnpm-workspace.yaml` med:
     - `packages: ["."]`
     - `minimumReleaseAge: 10080` (7 dager)
   - Nye pakkeversjoner må være minst 7 dager gamle før de kan installeres. Dette gir rom for at angrep av typen Shai Hulud oppdages før vi trekker inn kompromitterte versjoner.

4. **Oppdaterer CI (GitHub Actions) til pnpm + «incident mode»**
   - `Node.js CI` bruker nå:
     - `actions/setup-node` med `cache: "pnpm"`.
     - `corepack enable` + `corepack prepare pnpm@9.15.4 --activate`.
     - `pnpm install --frozen-lockfile` til vanlig.
   - Vi legger til et manuelt `workflow_dispatch`-input `incident_mode`. Når dette er `true`, kjører install-steg:
     - `pnpm install --frozen-lockfile --ignore-scripts`
   - Dette blokkerer `preinstall`/`postinstall`-scripts i en krisesituasjon, mens vi fortsatt bruker eksisterende lockfil.

5. **Dokumenterer lokal utviklerflyt og beredskap**
   - README oppdateres til å bruke `pnpm`-kommandoer (`pnpm install`, `pnpm run dev`, `pnpm test`, osv.).
   - README beskriver kort:
     - Hvordan pnpm brukes til daglig.
     - Hva utviklere skal gjøre ved et nytt supply-chain-angrep (stoppe deploys, ikke endre lockfil, eventuelt aktivere `ignore-scripts` lokalt via `.pnpmrc`).

## Alternatives considered

1. **Fortsette med npm med strammere praksis**
   - Mulig å stramme inn ved å:
     - Bruke `npm ci` konsekvent.
     - Låse versjoner eksplisitt.
     - Konfigurere `.npmrc` for å ignorere scripts midlertidig.
   - Ulempe: npm mangler `minimumReleaseAge` og har mindre isolert caching-modell enn pnpm.
   - Vurdering: En klar forbedring vs dagens, men gir mindre støtte for tiltak som karantenetid.

2. **Flytte hele stacken til Deno/Bun**
   - Potensiell gevinst i form av annet dependency-regime og runtime.
   - Ulempe: Krever større omskriving av Next.js-baserte deler, Drizzle, NextAuth m.m.
   - Vurdering: For omfattende for dette prosjektet nå, og ikke nødvendig for å adressere Shai Hulud-lignende angrep.

3. **Introdusere privat npm-registry / artifact-feed nå**
   - Kunne gitt mulighet til å «koble fra» public npm ved neste angrep.
   - Ulempe: Mer operasjonell kompleksitet (drift av registry, speiling, policyer).
   - Vurdering: Relevant på sikt i større miljøer, men utenfor scope for dette prosjektet akkurat nå.

## Consequences

### Positive

- **Mer deterministiske bygg**
  - Eksplisitte versjoner + pnpm-lock gir forutsigbare dependency-grafer lokalt, i CI og på Scalingo.

- **Redusert risiko ved nye publiseringer**
  - `minimumReleaseAge` gjør at nye pakkeversjoner ikke tas i bruk umiddelbart. Dette kan redusere eksponeringstiden ved supply-chain-angrep.

- **Bedre beredskap**
  - «Incident mode» i CI (`--ignore-scripts`) gir oss en rask, dokumentert måte å stanse potensielt ondsinnede install-scripts på mens vi fortsatt kan bygge på eksisterende lockfil.
  - README dokumenterer hva utviklere skal gjøre i en krisesituasjon (fryse deploy, ikke røre lockfil, eventuelt bruke `ignore-scripts` lokalt).

- **Klar standard for verktøykjede**
  - `packageManager`-feltet sikrer at både utviklere og CI bruker samme pnpm-versjon, via corepack.

### Negative / trade-offs

- **Liten terskel for utviklere som ikke har pnpm fra før**
  - Utviklere må aktivere corepack eller installere pnpm globalt.
  - Nytt verktøy å forholde seg til sammenlignet med «ren» npm.

- **Ytterligere kompleksitet i CI-konfigurasjon**
  - Incident-mode, corepack og pnpm cache gir litt mer logikk i workflow-filen.

- **Karantenetid kan forsinke nødvendige oppgraderinger**
  - I noen tilfeller kan vi måtte overstyre `minimumReleaseAge` (f.eks. ved sikkerhetsoppdateringer vi aktivt ønsker raskt). Dette krever bevisst handling og eventuelle midlertidige justeringer.

## Implementation notes

- pnpm er aktivert lokalt via corepack (`corepack enable` + `corepack prepare pnpm@9.15.4 --activate`).
- Eksisterende `package-lock.json` kan beholdes en periode som fallback/historikk, men `pnpm-lock.yaml` er nå kilde for sannhet.
- Ved fremtidige dependency-endringer:
  - Bruk `pnpm add` / `pnpm update`.
  - Committ både `package.json` og `pnpm-lock.yaml`.
