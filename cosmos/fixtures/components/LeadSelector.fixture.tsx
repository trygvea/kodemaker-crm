"use client";

import { useState } from "react";
import { LeadSelector } from "@/components/activity-log/lead-selector";
import type { LeadStatus } from "@/types/api";

type Lead = {
  id: number;
  description: string;
  status: LeadStatus;
};

const mockLeads: Lead[] = [
  { id: 1, description: "Ny kunde som ønsker konsultasjon om React og TypeScript", status: "NEW" },
  { id: 2, description: "Potensiell kunde interessert i backend-utvikling", status: "IN_PROGRESS" },
  { id: 3, description: "Følger opp på møte fra forrige uke", status: "IN_PROGRESS" },
  { id: 4, description: "Ny kunde som ønsker konsultasjon om React og TypeScript", status: "WON" },
  { id: 5, description: "Kunde som ikke svarte på tilbud", status: "LOST" },
];

function InteractiveLeadSelector() {
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  return (
    <div className="space-y-4 w-80">
      <LeadSelector
        leads={mockLeads}
        selectedLead={selectedLead}
        onSelect={setSelectedLead}
        open={open}
        onOpenChange={setOpen}
        query={query}
        onQueryChange={setQuery}
      />
      <div className="text-sm text-muted-foreground">
        Selected: {selectedLead ? `${selectedLead.id} - ${selectedLead.description}` : "None"}
      </div>
    </div>
  );
}

function EmptyLeadSelector() {
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  return (
    <div className="space-y-4 w-80">
      <LeadSelector
        leads={[]}
        selectedLead={selectedLead}
        onSelect={setSelectedLead}
        open={open}
        onOpenChange={setOpen}
        query={query}
        onQueryChange={setQuery}
      />
      <p className="text-sm text-muted-foreground">No leads available</p>
    </div>
  );
}

function SelectedLeadSelector() {
  const [selectedLead, setSelectedLead] = useState<Lead | null>(mockLeads[0]);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  return (
    <div className="space-y-4 w-80">
      <LeadSelector
        leads={mockLeads}
        selectedLead={selectedLead}
        onSelect={setSelectedLead}
        open={open}
        onOpenChange={setOpen}
        query={query}
        onQueryChange={setQuery}
      />
      <p className="text-sm text-muted-foreground">A lead is pre-selected</p>
    </div>
  );
}

export default {
  default: <InteractiveLeadSelector />,
  empty: <EmptyLeadSelector />,
  selected: <SelectedLeadSelector />,
};
