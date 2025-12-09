"use client";
import useSWR from "swr";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";

type Company = {
  id: number;
  name: string;
  websiteUrl?: string | null;
  emailDomain?: string | null;
  leadCounts?: {
    NEW: number;
    IN_PROGRESS: number;
    LOST: number;
    WON: number;
    BORTFALT: number;
  };
};

export default function CustomersPage() {
  const { data } = useSWR<Company[]>(`/api/companies`);
  const [search, setSearch] = useState("");
  const filtered = useMemo(
    () =>
      (data || []).filter((c) =>
        c.name.toLowerCase().includes(search.toLowerCase())
      ),
    [data, search],
  );
  const router = useRouter();

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Organisasjoner</h1>
      <div className="flex gap-2 items-center justify-between">
        <Input
          autoFocus
          className="max-w-sm"
          placeholder="Søk i organisasjoner"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <div className="divide-y border rounded">
        {filtered.map((c) => {
          const newOrInProgress = (c.leadCounts?.NEW ?? 0) +
            (c.leadCounts?.IN_PROGRESS ?? 0);
          const showActiveLead = newOrInProgress > 1;

          return (
            <div
              key={c.id}
              className="p-3 flex items-center justify-between cursor-pointer hover:bg-muted/30"
              onClick={() => router.push(`/customers/${c.id}`)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  router.push(`/customers/${c.id}`);
                }
              }}
            >
              <div className="font-medium">{c.name}</div>
              <div className="flex items-center gap-2">
                {showActiveLead && (
                  <span className="inline-flex items-center rounded-full bg-orange-100 text-orange-700 px-2 py-0.5 text-xs">
                    Aktiv lead
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
