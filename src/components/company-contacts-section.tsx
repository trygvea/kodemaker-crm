"use client";
import { useRouter } from "next/navigation";
import { NewContactDialog } from "@/components/dialogs/new-contact-dialog";
import type { GetCompanyDetailResponse } from "@/types/api";

type CompanyContactsSectionProps = {
  company: GetCompanyDetailResponse["company"];
  contacts: GetCompanyDetailResponse["contacts"];
};

export function CompanyContactsSection(
  { company, contacts }: CompanyContactsSectionProps,
) {
  const router = useRouter();

  return (
    <section>
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-lg font-medium">Kontakter</h2>
        <NewContactDialog companyId={company.id} companyName={company.name} />
      </div>
      <div className="divide-y rounded border">
        {contacts.length
          ? (
            contacts.map((c) => (
              <div
                key={c.id}
                className="flex cursor-pointer items-center justify-between p-3 hover:bg-muted"
                role="button"
                tabIndex={0}
                onClick={() => router.push(`/contacts/${c.id}`)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    router.push(`/contacts/${c.id}`);
                  }
                }}
              >
                <div>
                  <div className="font-medium">
                    {c.firstName} {c.lastName}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {c.role ?? ""}
                  </div>
                </div>
              </div>
            ))
          )
          : <div className="p-3 text-sm text-muted-foreground">Ingen</div>}
      </div>
    </section>
  );
}
