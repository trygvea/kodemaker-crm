"use client";
import { useRouter } from "next/navigation";
import type { GetContactDetailResponse } from "@/types/api";

type ContactCompaniesSectionProps = {
  previousCompanies: GetContactDetailResponse["previousCompanies"];
};

export function ContactCompaniesSection({
  previousCompanies,
}: ContactCompaniesSectionProps) {
  const router = useRouter();

  return (
    <section>
      <h2 className="mb-2 text-lg font-medium">Tidligere organisasjoner</h2>
      <div className="divide-y rounded border">
        {previousCompanies.length
          ? (
            previousCompanies.map((co) => (
              <div
                key={`${co.id}-${co.startDate}-${co.endDate}`}
                className="cursor-pointer p-3 hover:bg-muted"
                role="button"
                tabIndex={0}
                onClick={() => router.push(`/customers/${co.id}`)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    router.push(`/customers/${co.id}`);
                  }
                }}
              >
                <div className="font-medium">{co.name}</div>
                <div className="text-sm text-muted-foreground">
                  {co.startDate} - {co.endDate}
                </div>
              </div>
            ))
          )
          : <div className="p-3 text-sm text-muted-foreground">Ingen</div>}
      </div>
    </section>
  );
}
