"use client";
import useSWR from "swr";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { NewContactDialog } from "@/components/customers/new-contact-dialog";
import { PageBreadcrumbs } from "@/components/page-breadcrumbs";
import { CreatedBy } from "@/components/created-by";
import { CompanyHeader } from "@/components/entity-summary-header";

import type { GetCompanyDetailResponse } from "@/types/api";

export default function CompanyDetailPage() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  const router = useRouter();
  const { data, mutate } = useSWR<GetCompanyDetailResponse>(
    id ? `/api/companies/${id}` : null,
  );
  const [newComment, setNewComment] = useState("");

  if (!data) return <div className="p-6">Laster...</div>;
  const { company, contacts, comments, leads } = data;
  async function saveComment() {
    const body = { content: newComment, companyId: company.id };
    const res = await fetch("/api/comments", {
      method: "POST",
      body: JSON.stringify(body),
    });
    if (res.ok) {
      setNewComment("");
      mutate();
    }
  }

  return (
    <div className="p-6 space-y-6">
      <PageBreadcrumbs
        items={[{ label: "Organisasjoner", href: "/customers" }, {
          label: company.name,
        }]}
      />
      <CompanyHeader
        company={company}
        editHref={`/customers/${company.id}/edit`}
      />

      <section>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-medium">Kontakter</h2>
          <NewContactDialog companyId={company.id} companyName={company.name} />
        </div>
        <div className="border rounded divide-y">
          {contacts.map((c) => (
            <div
              key={c.id}
              className="p-3 flex items-center justify-between hover:bg-muted cursor-pointer"
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
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-medium">Kommentarer</h2>
        </div>
        <div className="space-y-2">
          <textarea
            rows={3}
            className="w-full border rounded p-2 text-sm resize-y"
            placeholder="Skriv en kommentar…"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />
          <div className="flex justify-end">
            <button
              className="inline-flex items-center rounded bg-primary text-primary-foreground px-3 py-1.5 text-sm disabled:opacity-50"
              disabled={!newComment.trim()}
              onClick={saveComment}
            >
              Lagre kommentar
            </button>
          </div>
        </div>
        <div className="border rounded divide-y mt-3">
          {comments.length
            ? (
              comments.map((c) => (
                <div key={c.id} className="p-3">
                  <div className="text-xs text-muted-foreground mb-1">
                    {new Date(c.createdAt).toLocaleString()}
                  </div>
                  <div className="whitespace-pre-wrap text-sm">{c.content}</div>
                </div>
              ))
            )
            : <div className="p-3 text-sm text-muted-foreground">Ingen</div>}
        </div>
      </section>

      <section>
        <div className="border rounded divide-y">
          {leads.map((l) => (
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
          ))}
        </div>
      </section>
      <CreatedBy createdAt={company.createdAt} createdBy={data.createdBy} />
    </div>
  );
}
