import React, { useMemo } from "react";
import type { ApiLead } from "@/types/api";

type LeadsSectionProps = {
  leads: ApiLead[];
  title?: string;
  headerAction?: React.ReactNode;
};

export function LeadsSection(
  { leads, title = "Leads", headerAction }: LeadsSectionProps,
) {
  const stats = useMemo(() => {
    const counts = {
      NEW: 0,
      IN_PROGRESS: 0,
      WON: 0,
      LOST: 0,
      BORTFALT: 0,
    };
    for (const lead of leads) {
      const status = lead.status as keyof typeof counts;
      if (status in counts) {
        counts[status] = (counts[status] || 0) + 1;
      }
    }
    return counts;
  }, [leads]);

  return (
    <section>
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-lg font-medium">{title}</h2>
        {headerAction ?? null}
      </div>
      {leads.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
          <span>Ny: {stats.NEW}</span>
          <span>Under arbeid: {stats.IN_PROGRESS}</span>
          <span>Vunnet: {stats.WON}</span>
          <span>Tapt: {stats.LOST}</span>
          <span>Bortfalt: {stats.BORTFALT}</span>
        </div>
      )}
      <div className="divide-y rounded border">
        {leads.length
          ? (
            leads.map((l) => (
              <a key={l.id} href={`/leads/${l.id}`} className="block p-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm">
                    {l.description.length > 100
                      ? `${l.description.slice(0, 100)}…`
                      : l.description}
                  </div>
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs ${
                      l.status === "NEW"
                        ? "bg-blue-100 text-blue-700"
                        : l.status === "IN_PROGRESS"
                        ? "bg-amber-100 text-amber-800"
                        : l.status === "LOST"
                        ? "bg-red-100 text-red-700"
                        : l.status === "WON"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {l.status === "NEW"
                      ? "Ny"
                      : l.status === "IN_PROGRESS"
                      ? "Under arbeid"
                      : l.status === "LOST"
                      ? "Tapt"
                      : l.status === "WON"
                      ? "Vunnet"
                      : "Bortfalt"}
                  </span>
                </div>
              </a>
            ))
          )
          : <div className="p-3 text-sm text-muted-foreground">Ingen</div>}
      </div>
    </section>
  );
}
