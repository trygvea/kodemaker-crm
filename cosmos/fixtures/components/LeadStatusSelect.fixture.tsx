"use client";

import { useState } from "react";
import { LeadStatusSelect, type LeadStatus } from "@/components/lead-status-select";
import { Label } from "@/components/ui/label";

function InteractiveLeadStatusSelect({ initialValue }: { initialValue: LeadStatus }) {
  const [value, setValue] = useState<LeadStatus>(initialValue);
  return (
    <div className="space-y-2 w-64">
      <Label>Status</Label>
      <LeadStatusSelect value={value} onValueChange={setValue} />
      <p className="text-sm text-muted-foreground">Valgt: {value}</p>
    </div>
  );
}

export default {
  default: <InteractiveLeadStatusSelect initialValue="NEW" />,
  inProgress: <InteractiveLeadStatusSelect initialValue="IN_PROGRESS" />,
  won: <InteractiveLeadStatusSelect initialValue="WON" />,
  lost: <InteractiveLeadStatusSelect initialValue="LOST" />,
  bortfalt: <InteractiveLeadStatusSelect initialValue="BORTFALT" />,
};
