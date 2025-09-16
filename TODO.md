Nye
- ? Hendelseslogg: Bør kanskje ha created by?


Refaktorering
- be om å få laget tester for alle komponenter
- Lag react komponent av kommentarer og oppfølginger
- Be om å oppdatere README.md
- Be om å lage AGENTS.md
- Be om andre refaktoreringer/opprydning av død kode.
- 
- 

Siste
- Edit kunde og kontakt
v Motta bcc og forward
- Lag repository for enklere database aksess?
v Må ha en fiks for kontakter som ikke er assignet til noen kunde.
  v 1. Automatisk ved insert av Email.
  - 2. Manuelt!! Kunde: Legg til kontakt - side? Men ansatt-dato. NB også for kontakter som bytter kunde!
v Ved mail mottak, opprett firma og kontakt-historikk om det ikke finnes
v Ved forward-motak, opprett kommentar med forward body.
  - Også vis kommentarer på email-siden.
v Lag hendelseslogg entitet, med dato, objekttype, objektid (for link), brukerid
- Startbilde: siste hendelser: leads, eposter, kommentarer, nye kunder og kontakter
  - Passerte oppfølginger
v Hendelsesliste er primærlisten på kunde og kontakt.
- Dato på alle lister
- Rename kunde -> organisasjon
- Kommentater: lage kommentarer for kunde, kontakter og leads
- Oppfølginger: Ny side, eget menyvalg.
  - lage oppfølginger for kunde, kontakter og leads
  - Alle kan lage oppfølginger
  - Normalt kan man kun se egne oppføgninger, men kan velge alle.
  - Eget menyvalg
- En kontakt må kunne ha flere eposter.

Bugs

- Fix Contact hydration error

Features

- Les epost
- Legg til oppføgning/actions
- Begrens rettigheter for ikke-admins
- Overføre repo til kodemaker.no
- Lag endelig deploy mot kodemaker rep og kodemaker secrets.
-

Maybe?

- Bilde for endre kontakt/kunde-historikk
- Ny side for kontakter,med søk
- Idé: Kundeliste: også søk i kontakt, vis kontakter under kunder hvis < x kunder/kontakter
- Idé: Nytt menyvalg: Kontakter, som gir søkbar kontaktliste. Evt kombiner kunder og kontakter på samme bilde, ex via tabs eller full merge.
- Man må kunne angi ny kontakt på ny lead.
