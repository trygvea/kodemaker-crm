import { CreateNewMenu } from "@/components/create-new-menu";

function FixtureCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2 rounded border p-4 bg-card">
      <div>
        <p className="text-sm font-semibold">{title}</p>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </div>
      {children}
    </div>
  );
}

export default {
  default: (
    <FixtureCard title="Standard" description="Uten forhåndsvalgt organisasjon eller kontakt.">
      <CreateNewMenu />
    </FixtureCard>
  ),
  withContext: (
    <FixtureCard
      title="Med kontekst"
      description="Knytter ny lead/kontakt til valgt organisasjon og kontakt (nyttig når man står på de sidene)."
    >
      <div className="text-xs text-muted-foreground">
        <div>Organisasjon: Kodemaker (ID 1)</div>
        <div>Kontakt: Ola Nordmann (ID 5)</div>
      </div>
      <CreateNewMenu
        companyId={1}
        companyName="Kodemaker"
        contactId={5}
        contactName="Ola Nordmann"
      />
    </FixtureCard>
  ),
};
