"use client";

import { LeadReference } from "@/components/activity-log/lead-reference";
import type { LeadStatus } from "@/types/api";

const shortLead = {
  id: 1,
  description: "Ny kunde",
  status: "NEW" as LeadStatus,
};

const mediumLead = {
  id: 2,
  description: "Potensiell kunde interessert i backend-utvikling",
  status: "IN_PROGRESS" as LeadStatus,
};

const longLead = {
  id: 3,
  description:
    "Ny kunde som ønsker konsultasjon om React og TypeScript utvikling for deres nye prosjekt",
  status: "WON" as LeadStatus,
};

export default {
  default: <LeadReference lead={shortLead} />,
  medium: <LeadReference lead={mediumLead} />,
  long: <LeadReference lead={longLead} />,
  inProgress: <LeadReference lead={{ ...mediumLead, status: "IN_PROGRESS" }} />,
  lost: <LeadReference lead={{ ...mediumLead, status: "LOST" }} />,
  won: <LeadReference lead={{ ...mediumLead, status: "WON" }} />,
  bortfalt: <LeadReference lead={{ ...mediumLead, status: "BORTFALT" }} />,
};
