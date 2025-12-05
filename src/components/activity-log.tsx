"use client";
import { useMemo, useState } from "react";
import useSWR, { useSWRConfig } from "swr";
import { CalendarPlus, MessageSquarePlus } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { useDueBgStyle } from "@/components/followups-list";
import type { ApiEmail } from "@/types/api";

type FollowupItem = {
    id: number;
    note: string;
    dueAt: string;
    completedAt?: string | null;
    createdAt: string;
    createdBy?: { firstName?: string | null; lastName?: string | null } | null;
    company?: { id: number; name: string } | null;
    contact?:
        | { id: number; firstName: string | null; lastName: string | null }
        | null;
    lead?: { id: number; description: string } | null;
};

type CommentItem = {
    id: number;
    content: string;
    createdAt: string;
    createdBy?: { firstName?: string | null; lastName?: string | null } | null;
};

type ActivityItem =
    | { type: "followup"; data: FollowupItem }
    | { type: "comment"; data: CommentItem }
    | { type: "email"; data: ApiEmail };

type ActivityLogProps = {
    contactId?: number;
    companyId?: number;
    contactIds?: number[];
    initialEmails?: ApiEmail[];
};

function getDefaultDueDate(): string {
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
}

function buildQueryParams(
    contactId?: number,
    companyId?: number,
    contactIds?: number[],
) {
    const followupParams = contactId
        ? `contactId=${contactId}&all=1`
        : companyId
        ? `companyId=${companyId}&all=1`
        : "all=1";

    const commentParams = contactId
        ? `contactId=${contactId}`
        : companyId
        ? `companyId=${companyId}`
        : null;

    const emailParams = contactId
        ? `contactId=${contactId}`
        : companyId
        ? `companyId=${companyId}`
        : contactIds && contactIds.length > 0
        ? `contactIds=${contactIds.join(",")}`
        : null;

    return { followupParams, commentParams, emailParams };
}

export function ActivityLog(
    { contactId, companyId, contactIds, initialEmails = [] }: ActivityLogProps,
) {
    const [activeTab, setActiveTab] = useState<"followup" | "comment">(
        "followup",
    );
    const [newComment, setNewComment] = useState("");
    const [newFollowupNote, setNewFollowupNote] = useState("");
    const [newFollowupDue, setNewFollowupDue] = useState(getDefaultDueDate());
    const { mutate: globalMutate } = useSWRConfig();
    const dueBgStyle = useDueBgStyle();

    const { followupParams, commentParams, emailParams } = buildQueryParams(
        contactId,
        companyId,
        contactIds,
    );

    const { data: openFollowups, mutate: mutateOpenFollowups } = useSWR<
        FollowupItem[]
    >(
        `/api/followups?${followupParams}`,
    );

    const { data: completedFollowups, mutate: mutateCompletedFollowups } =
        useSWR<FollowupItem[]>(
            `/api/followups?${followupParams}&completed=1`,
        );

    const { data: comments, mutate: mutateComments } = useSWR<CommentItem[]>(
        commentParams ? `/api/comments?${commentParams}` : null,
    );

    const { data: fetchedEmails, mutate: mutateEmails } = useSWR<ApiEmail[]>(
        emailParams ? `/api/emails?${emailParams}` : null,
        { fallbackData: initialEmails },
    );

    const emails = fetchedEmails ?? initialEmails;

    async function saveComment() {
        const body = {
            content: newComment,
            ...(contactId ? { contactId } : {}),
            ...(companyId ? { companyId } : {}),
        };
        const res = await fetch("/api/comments", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });
        if (res.ok) {
            setNewComment("");
            if (commentParams) {
                await mutateComments(undefined, { revalidate: true });
                await globalMutate(`/api/comments?${commentParams}`);
            }
            if (emailParams) {
                await mutateEmails(undefined, { revalidate: true });
            }
        }
    }

    async function saveFollowup() {
        const body = {
            note: newFollowupNote,
            dueAt: newFollowupDue,
            ...(contactId ? { contactId } : {}),
            ...(companyId ? { companyId } : {}),
        };
        const res = await fetch("/api/followups", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });
        if (res.ok) {
            setNewFollowupNote("");
            setNewFollowupDue(getDefaultDueDate());
            await mutateOpenFollowups(undefined, { revalidate: true });
            await globalMutate(`/api/followups?${followupParams}`);
            if (emailParams) {
                await mutateEmails(undefined, { revalidate: true });
            }
        }
    }

    async function completeFollowup(followupId: number) {
        const res = await fetch(`/api/followups/${followupId}`, {
            method: "PATCH",
        });
        if (res.ok) {
            await mutateOpenFollowups(undefined, { revalidate: true });
            await mutateCompletedFollowups(undefined, { revalidate: true });
            await globalMutate(`/api/followups?${followupParams}`);
            await globalMutate(`/api/followups?${followupParams}&completed=1`);
            if (emailParams) {
                await mutateEmails(undefined, { revalidate: true });
            }
        }
    }

    const recentActivities = useMemo(() => {
        const items: ActivityItem[] = [];

        if (Array.isArray(completedFollowups)) {
            for (const f of completedFollowups) {
                items.push({ type: "followup", data: f });
            }
        }

        if (Array.isArray(comments)) {
            for (const c of comments) {
                items.push({ type: "comment", data: c });
            }
        }

        if (Array.isArray(emails)) {
            for (const e of emails) {
                items.push({ type: "email", data: e });
            }
        }

        return items.sort((a, b) => {
            const dateA = a.type === "followup"
                ? a.data.completedAt || a.data.createdAt
                : a.type === "comment"
                ? a.data.createdAt
                : a.data.createdAt;
            const dateB = b.type === "followup"
                ? b.data.completedAt || b.data.createdAt
                : b.type === "comment"
                ? b.data.createdAt
                : b.data.createdAt;
            return new Date(dateB).getTime() - new Date(dateA).getTime();
        });
    }, [completedFollowups, comments, emails]);

    return (
        <section className="bg-muted rounded-lg p-4">
            <h2 className="text-lg font-medium mb-4">Aktivitetslogg</h2>
            <div className="bg-background rounded p-4">
                <Tabs
                    value={activeTab}
                    onValueChange={(v) =>
                        setActiveTab(v as "followup" | "comment")}
                >
                    <TabsList>
                        <TabsTrigger value="followup">Oppfølging</TabsTrigger>
                        <TabsTrigger value="comment">Kommentar</TabsTrigger>
                    </TabsList>
                    <TabsContent value="followup" className="mt-4">
                        <div className="space-y-3">
                            <Textarea
                                rows={3}
                                placeholder="Notat…"
                                value={newFollowupNote}
                                onChange={(e) =>
                                    setNewFollowupNote(e.target.value)}
                            />
                            <div className="flex items-start gap-3">
                                <div className="flex-1">
                                    <label className="block text-xs text-muted-foreground mb-1">
                                        Frist
                                    </label>
                                    <input
                                        type="datetime-local"
                                        className="w-full border rounded p-2 text-sm"
                                        value={newFollowupDue}
                                        onChange={(e) =>
                                            setNewFollowupDue(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end">
                                <Button
                                    onClick={saveFollowup}
                                    disabled={!newFollowupNote.trim() ||
                                        !newFollowupDue}
                                    size="sm"
                                >
                                    <CalendarPlus className="h-4 w-4 mr-1.5" />
                                    Lagre oppfølgning
                                </Button>
                            </div>
                        </div>
                    </TabsContent>
                    <TabsContent value="comment" className="mt-4">
                        <div className="space-y-3">
                            <Textarea
                                rows={3}
                                placeholder="Skriv en kommentar…"
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                            />
                            <div className="flex justify-end">
                                <Button
                                    onClick={saveComment}
                                    disabled={!newComment.trim()}
                                    size="sm"
                                >
                                    <MessageSquarePlus className="h-4 w-4 mr-1.5" />
                                    Lagre kommentar
                                </Button>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>

            <div className="mt-6 space-y-6">
                <div className="bg-background rounded p-4">
                    <h3 className="text-sm font-medium mb-2">
                        Krever handling:
                    </h3>
                    {openFollowups === undefined
                        ? (
                            <div className="p-3 text-sm text-muted-foreground">
                                Laster…
                            </div>
                        )
                        : !Array.isArray(openFollowups) ||
                                openFollowups.length === 0
                        ? (
                            <div className="border rounded p-3 text-sm text-muted-foreground">
                                Ingen
                            </div>
                        )
                        : (
                            <div className="border rounded divide-y">
                                {openFollowups.map((f) => (
                                    <div key={f.id} className="p-3">
                                        <div className="flex items-center justify-between mb-1 text-xs text-muted-foreground">
                                            <div
                                                className="px-1 rounded"
                                                style={dueBgStyle(f.dueAt)}
                                            >
                                                Frist: {new Date(f.dueAt)
                                                    .toLocaleString()}
                                                {f.createdBy
                                                    ? ` · Av: ${
                                                        f.createdBy.firstName ??
                                                            ""
                                                    } ${
                                                        f.createdBy.lastName ??
                                                            ""
                                                    }`
                                                    : ""}
                                                {f.contact || f.company ||
                                                        f.lead
                                                    ? (
                                                        <span>
                                                            {" "}
                                                            · På {f.lead
                                                                ? (
                                                                    <a
                                                                        className="underline"
                                                                        href={`/leads/${f.lead.id}`}
                                                                    >
                                                                        {f.lead
                                                                                .description
                                                                                .length >
                                                                                50
                                                                            ? `${
                                                                                f.lead
                                                                                    .description
                                                                                    .slice(
                                                                                        0,
                                                                                        50,
                                                                                    )
                                                                            }…`
                                                                            : f.lead
                                                                                .description}
                                                                    </a>
                                                                )
                                                                : null}
                                                            {f.lead &&
                                                                    (f.contact ||
                                                                        f.company)
                                                                ? " / "
                                                                : ""}
                                                            {f.contact
                                                                ? (
                                                                    <a
                                                                        className="underline"
                                                                        href={`/contacts/${f.contact.id}`}
                                                                    >
                                                                        {(f.contact
                                                                            .firstName ??
                                                                            "") +
                                                                            " " +
                                                                            (f.contact
                                                                                .lastName ??
                                                                                "")}
                                                                    </a>
                                                                )
                                                                : null}
                                                            {f.contact &&
                                                                    f.company
                                                                ? " / "
                                                                : ""}
                                                            {f.company
                                                                ? (
                                                                    <a
                                                                        className="underline"
                                                                        href={`/customers/${f.company.id}`}
                                                                    >
                                                                        {f.company
                                                                            .name}
                                                                    </a>
                                                                )
                                                                : null}
                                                        </span>
                                                    )
                                                    : null}
                                            </div>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                    completeFollowup(f.id)}
                                            >
                                                Merk som utført
                                            </Button>
                                        </div>
                                        <div className="whitespace-pre-wrap text-sm">
                                            {f.note}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                </div>

                <div className="bg-background rounded p-4">
                    <h3 className="text-sm font-medium mb-2">Siste nytt:</h3>
                    {recentActivities.length === 0
                        ? (
                            <div className="border rounded p-3 text-sm text-muted-foreground">
                                Ingen
                            </div>
                        )
                        : (
                            <div className="border rounded divide-y">
                                {recentActivities.map((item) => {
                                    if (item.type === "comment") {
                                        const c = item.data;
                                        return (
                                            <div
                                                key={`comment-${c.id}`}
                                                className="p-3"
                                            >
                                                <div className="flex items-center justify-between gap-2 mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs text-muted-foreground">
                                                            {new Date(
                                                                c.createdAt,
                                                            )
                                                                .toLocaleString()}
                                                        </span>
                                                        {c.createdBy && (
                                                            <span className="text-xs text-muted-foreground">
                                                                · {c.createdBy
                                                                    .firstName ??
                                                                    ""}{" "}
                                                                {c.createdBy
                                                                    .lastName ??
                                                                    ""}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <Badge variant="secondary">
                                                        Kommentar
                                                    </Badge>
                                                </div>
                                                <div className="whitespace-pre-wrap text-sm">
                                                    {c.content}
                                                </div>
                                            </div>
                                        );
                                    }

                                    if (item.type === "followup") {
                                        const f = item.data;
                                        return (
                                            <div
                                                key={`followup-${f.id}`}
                                                className="p-3"
                                            >
                                                <div className="flex items-center justify-between gap-2 mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs text-muted-foreground">
                                                            {f.completedAt
                                                                ? new Date(
                                                                    f.completedAt,
                                                                ).toLocaleString()
                                                                : new Date(
                                                                    f.createdAt,
                                                                ).toLocaleString()}
                                                        </span>
                                                        {f.createdBy && (
                                                            <span className="text-xs text-muted-foreground">
                                                                · Laget av:{" "}
                                                                {f.createdBy
                                                                    .firstName ??
                                                                    ""}{" "}
                                                                {f.createdBy
                                                                    .lastName ??
                                                                    ""}
                                                            </span>
                                                        )}
                                                        {f.contact && (
                                                            <span className="text-xs text-muted-foreground">
                                                                · På:{" "}
                                                                <a
                                                                    className="underline"
                                                                    href={`/contacts/${f.contact.id}`}
                                                                >
                                                                    {f.contact
                                                                        .firstName ??
                                                                        ""}{" "}
                                                                    {f.contact
                                                                        .lastName ??
                                                                        ""}
                                                                </a>
                                                            </span>
                                                        )}
                                                    </div>
                                                    <Badge variant="secondary">
                                                        Oppfølging
                                                    </Badge>
                                                </div>
                                                <div className="whitespace-pre-wrap text-sm">
                                                    {f.note}
                                                </div>
                                            </div>
                                        );
                                    }

                                    if (item.type === "email") {
                                        const e = item.data;
                                        return (
                                            <div
                                                key={`email-${e.id}`}
                                                className="p-3"
                                            >
                                                <div className="flex items-center justify-between gap-2 mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs text-muted-foreground">
                                                            {new Date(
                                                                e.createdAt,
                                                            )
                                                                .toLocaleString()}
                                                        </span>
                                                        {e.sourceUser && (
                                                            <span className="text-xs text-muted-foreground">
                                                                · Avsender:{" "}
                                                                {e.sourceUser
                                                                    .firstName ??
                                                                    ""}{" "}
                                                                {e.sourceUser
                                                                    .lastName ??
                                                                    ""}
                                                            </span>
                                                        )}
                                                        {e.recipientContact && (
                                                            <span className="text-xs text-muted-foreground">
                                                                · Mottaker:{" "}
                                                                {e.recipientContact
                                                                    .firstName ??
                                                                    ""}{" "}
                                                                {e.recipientContact
                                                                    .lastName ??
                                                                    ""}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <Badge variant="secondary">
                                                        E-post
                                                    </Badge>
                                                </div>
                                                {e.subject && (
                                                    <div className="font-medium mb-1 text-sm">
                                                        {e.subject}
                                                    </div>
                                                )}
                                                <Accordion
                                                    type="single"
                                                    collapsible
                                                >
                                                    <AccordionItem
                                                        value={`email-${e.id}`}
                                                    >
                                                        <AccordionTrigger className="group hover:no-underline text-left font-normal">
                                                            <div
                                                                className="whitespace-pre-wrap break-all text-sm group-data-[state=open]:hidden flex-1 min-w-0"
                                                                style={{
                                                                    maxHeight:
                                                                        "4.5em",
                                                                    overflow:
                                                                        "hidden",
                                                                }}
                                                            >
                                                                {e.content}
                                                            </div>
                                                        </AccordionTrigger>
                                                        <AccordionContent>
                                                            <div className="whitespace-pre-wrap break-all text-sm">
                                                                {e.content}
                                                            </div>
                                                        </AccordionContent>
                                                    </AccordionItem>
                                                </Accordion>
                                            </div>
                                        );
                                    }

                                    return null;
                                })}
                            </div>
                        )}
                </div>
            </div>
        </section>
    );
}
