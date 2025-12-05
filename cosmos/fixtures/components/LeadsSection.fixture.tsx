import { LeadsSection } from "@/components/leads-section";
import type { ApiLead } from "@/types/api";

const mockLeads: ApiLead[] = [
    {
        id: 1,
        description:
            "Første lead med lang beskrivelse som går over flere linjer for å teste hvordan det ser ut når teksten er lang",
        status: "NEW",
    },
    { id: 2, description: "Andre lead", status: "IN_PROGRESS" },
    { id: 3, description: "Tredje lead", status: "WON" },
    { id: 4, description: "Fjerde lead", status: "LOST" },
    { id: 5, description: "Femte lead", status: "BORTFALT" },
];

export default {
    default: <LeadsSection leads={mockLeads} />,
    empty: <LeadsSection leads={[]} />,
    single: <LeadsSection leads={[mockLeads[0]]} />,
};
