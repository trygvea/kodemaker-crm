"use client";
import useSWR, { useSWRConfig } from "swr";
import { useState } from "react";
import { PageBreadcrumbs } from "@/components/page-breadcrumbs";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { CreatedBy } from "@/components/created-by";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { CalendarPlus, MessageSquarePlus, Save } from "lucide-react";
import { toast } from "sonner";
import { LeadHeader } from "@/components/entity-summary-header";
import { FollowupsList } from "@/components/followups-list";

const schema = z.object({
  description: z.string().min(1),
  status: z.enum(["NEW", "IN_PROGRESS", "LOST", "WON", "BORTFALT"]),
});

export default function LeadDetailPage() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  const { data } = useSWR<{
    id: number;
    description: string;
    status: "NEW" | "IN_PROGRESS" | "LOST" | "WON" | "BORTFALT";
    createdAt: string;
    updatedAt: string;
    createdBy?: { firstName?: string | null; lastName?: string | null } | null;
    company?: { id: number; name: string } | null;
    contact?: { id: number; firstName: string; lastName: string } | null;
    comments: Array<{ id: number; content: string; createdAt: string }>;
  }>(id ? `/api/leads/${id}` : null);
  const { mutate } = useSWRConfig();
  const router = useRouter();
  const [newComment, setNewComment] = useState("");
  const [newFollowupNote, setNewFollowupNote] = useState("");
  const [newFollowupDue, setNewFollowupDue] = useState(() => {
    const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
    const d = new Date();
    d.setDate(d.getDate() + 7);
    d.setHours(9, 0, 0, 0);
    const y = d.getFullYear();
    const m = pad(d.getMonth() + 1);
    const day = pad(d.getDate());
    const hh = pad(d.getHours());
    const mm = pad(d.getMinutes());
    return `${y}-${m}-${day}T${hh}:${mm}`;
  });

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    values: data
      ? { description: data.description, status: data.status }
      : { description: "", status: "NEW" },
  });

  async function onSubmit(values: z.infer<typeof schema>) {
    const res = await fetch(`/api/leads/${id}`, {
      method: "PATCH",
      body: JSON.stringify(values),
    });
    if (!res.ok) return toast.error("Kunne ikke oppdatere lead");
    toast.success("Lead oppdatert");
    await mutate(`/api/leads/${id}`);
    const target = data?.contact
      ? `/contacts/${data.contact.id}`
      : data?.company
      ? `/customers/${data.company.id}`
      : "/customers";
    router.push(target);
  }

  async function saveComment() {
    const body = { content: newComment, leadId: id };
    const res = await fetch("/api/comments", {
      method: "POST",
      body: JSON.stringify(body),
    });
    if (!res.ok) return toast.error("Kunne ikke lagre kommentar");
    setNewComment("");
    await mutate(`/api/leads/${id}`);
  }

  async function saveFollowup() {
    const body = {
      note: newFollowupNote,
      dueAt: newFollowupDue,
      leadId: id,
      contactId: data?.contact?.id,
      companyId: data?.company?.id,
    };
    const res = await fetch("/api/followups", {
      method: "POST",
      body: JSON.stringify(body),
    });
    if (!res.ok) return toast.error("Kunne ikke lagre oppfølgning");
    toast.success("Oppfølgning opprettet");
    setNewFollowupNote("");
    const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
    const d = new Date();
    d.setDate(d.getDate() + 7);
    d.setHours(9, 0, 0, 0);
    const y = d.getFullYear();
    const m = pad(d.getMonth() + 1);
    const day = pad(d.getDate());
    const hh = pad(d.getHours());
    const mm = pad(d.getMinutes());
    setNewFollowupDue(`${y}-${m}-${day}T${hh}:${mm}`);
    await mutate(`/api/followups?leadId=${id}`);
  }

  if (!data) return <div className="p-6">Laster...</div>;
  const crumbs = [
    { label: "Organisasjoner", href: "/customers" },
    ...(data.company
      ? [{ label: data.company.name, href: `/customers/${data.company.id}` }]
      : []),
    ...(data.contact
      ? [
        {
          label: `${data.contact.firstName} ${data.contact.lastName}`,
          href: `/contacts/${data.contact.id}`,
        },
      ]
      : []),
    { label: "Lead" },
  ];
  return (
    <div className="p-6 space-y-6">
      <PageBreadcrumbs items={crumbs} />
      <LeadHeader
        company={data.company ?? null}
        contact={data.contact ?? null}
      />

      <section>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="grid grid-cols-2 gap-3 max-w-2xl"
          >
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel>Beskrivelse</FormLabel>
                  <FormControl>
                    <Textarea rows={10} className="resize-y" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Velg status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NEW">Ny</SelectItem>
                      <SelectItem value="IN_PROGRESS">Under arbeid</SelectItem>
                      <SelectItem value="LOST">Tapt</SelectItem>
                      <SelectItem value="WON">Vunnet</SelectItem>
                      <SelectItem value="BORTFALT">Bortfalt</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="col-span-2 flex justify-end">
              <Button
                type="submit"
                className="inline-flex items-center gap-1.5"
              >
                <Save className="h-4 w-4" /> Lagre
              </Button>
            </div>
            <div className="col-span-2">
              <h3 className="text-sm font-medium mb-1">Kommentarer</h3>
              <div className="space-y-2">
                <Textarea
                  rows={3}
                  className="resize-y"
                  placeholder="Skriv en kommentar…"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                />
                <div className="flex justify-end">
                  <Button
                    type="button"
                    disabled={!newComment.trim()}
                    onClick={saveComment}
                    className="inline-flex items-center gap-1.5"
                  >
                    <MessageSquarePlus className="h-4 w-4" /> Lagre kommentar
                  </Button>
                </div>
              </div>
              <div className="border rounded divide-y mt-3">
                {data.comments?.length
                  ? (
                    data.comments.map((c) => (
                      <div key={c.id} className="p-3">
                        <div className="text-xs text-muted-foreground mb-1">
                          {new Date(c.createdAt).toLocaleString()}
                        </div>
                        <div className="whitespace-pre-wrap text-sm">
                          {c.content}
                        </div>
                      </div>
                    ))
                  )
                  : (
                    <div className="p-3 text-sm text-muted-foreground">
                      Ingen
                    </div>
                  )}
              </div>
            </div>
          </form>
        </Form>
      </section>

      <section>
        <h2 className="text-lg font-medium mb-2">Oppfølgninger</h2>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <textarea
              rows={3}
              className="w-full border rounded p-2 text-sm resize-y"
              placeholder="Notat…"
              value={newFollowupNote}
              onChange={(e) => setNewFollowupNote(e.target.value)}
            />
          </div>
          <div className="w-48">
            <label className="block text-xs text-muted-foreground mb-1">
              Frist
            </label>
            <input
              type="datetime-local"
              className="w-full border rounded p-2 text-sm"
              value={newFollowupDue}
              onChange={(e) => setNewFollowupDue(e.target.value)}
            />
          </div>
        </div>
        <div className="flex justify-end mt-2">
          <button
            className="inline-flex items-center rounded bg-primary text-primary-foreground px-3 py-1.5 text-sm disabled:opacity-50"
            disabled={!newFollowupNote.trim() || !newFollowupDue}
            onClick={saveFollowup}
          >
            <CalendarPlus className="h-4 w-4 mr-1.5" />
            Lagre oppfølgning
          </button>
        </div>
        <FollowupsList endpoint={`/api/followups?leadId=${id}`} />
      </section>

      <CreatedBy createdAt={data.createdAt} createdBy={data.createdBy} />
    </div>
  );
}
