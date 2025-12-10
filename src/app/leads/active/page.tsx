"use client";
import useSWR from "swr";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";

export default function ActiveLeadsPage() {
  const { data } = useSWR<
    Array<{
      id: number;
      description: string;
      status: "NEW" | "IN_PROGRESS";
      createdAt: string;
      company?: { id: number; name: string } | null;
      contact?: { id: number; firstName: string; lastName: string } | null;
    }>
  >("/api/leads?status=NEW,IN_PROGRESS");
  const router = useRouter();

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Aktive leads</h1>
      <div className="border rounded divide-y">
        {data?.length
          ? (
            data.map((l) => (
              <div
                key={l.id}
                className="p-3 hover:bg-muted cursor-pointer"
                role="button"
                tabIndex={0}
                onClick={() => router.push(`/leads/${l.id}`)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    router.push(`/leads/${l.id}`);
                  }
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="text-sm">
                    <div className="font-medium">
                      {l.contact
                        ? (
                          <>
                            <a
                              href={`/contacts/${l.contact.id}`}
                              className="underline"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {l.contact.firstName} {l.contact.lastName}
                            </a>
                            {l.company ? <span>·</span> : null}
                          </>
                        )
                        : null}
                      {l.company
                        ? (
                          <a
                            href={`/customers/${l.company.id}`}
                            className="underline"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {l.company.name}
                          </a>
                        )
                        : null}
                    </div>
                    <div className="text-muted-foreground text-xs">
                      {new Date(l.createdAt).toLocaleString()}
                    </div>
                    <div className="mt-1">
                      {l.description.length > 100
                        ? `${l.description.slice(0, 100)}…`
                        : l.description}
                    </div>
                  </div>
                  {l.status === "NEW"
                    ? (
                      <Badge variant="default">
                        Ny
                      </Badge>
                    )
                    : (
                      <Badge variant="tertiary">
                        Under arbeid
                      </Badge>
                    )}
                </div>
              </div>
            ))
          )
          : <div className="p-3 text-sm text-muted-foreground">Ingen</div>}
      </div>
    </div>
  );
}
