"use client";
import { Badge } from "@/components/ui/badge";
import { CheckIcon } from "lucide-react";
import {
    formatDateTimeWithoutSeconds,
    getInitials,
    useDueBgStyle,
} from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";

export type FollowupItemData = {
    id: number;
    note: string;
    dueAt: string;
    completedAt?: string | null;
    createdAt: string;
    createdBy?: { firstName?: string | null; lastName?: string | null } | null;
    assignedTo?: { id: number; firstName: string; lastName: string } | null;
    company?: { id: number; name: string } | null;
    contact?:
        | { id: number; firstName: string | null; lastName: string | null }
        | null;
    lead?: { id: number; description: string } | null;
};

type FollowupItemProps = {
    followup: FollowupItemData;
    variant: "action" | "completed";
    onComplete?: (id: number) => void;
    showBadge?: boolean;
    entityLinks?: boolean;
};

function formatEntityReference(
    contact: FollowupItemData["contact"],
    company: FollowupItemData["company"],
    lead: FollowupItemData["lead"],
): string {
    const parts: string[] = [];
    if (lead) {
        parts.push(lead.description);
    }
    if (contact) {
        const name = `${contact.firstName ?? ""} ${contact.lastName ?? ""}`
            .trim();
        parts.push(name || `Contact[${contact.id}]`);
    }
    if (company) {
        parts.push(company.name);
    }
    return parts.join(" / ");
}

export function FollowupItem({
    followup,
    variant,
    onComplete,
    showBadge = true,
    entityLinks = false,
}: FollowupItemProps) {
    const dueBgStyle = useDueBgStyle();
    const isCompleted = !!followup.completedAt;
    const displayDate = formatDateTimeWithoutSeconds(
        followup.completedAt || followup.createdAt,
    );

    const entityRef = formatEntityReference(
        followup.contact,
        followup.company,
        followup.lead,
    );

    function renderEntityReference() {
        if (!followup.contact && !followup.company && !followup.lead) {
            return null;
        }

        if (entityLinks) {
            const parts: React.ReactNode[] = [];
            if (followup.lead) {
                parts.push(
                    <a
                        key="lead"
                        className="underline"
                        href={`/leads/${followup.lead.id}`}
                    >
                        {followup.lead.description.length > 50
                            ? `${followup.lead.description.slice(0, 50)}…`
                            : followup.lead.description}
                    </a>,
                );
            }
            if (followup.lead && (followup.contact || followup.company)) {
                parts.push(" / ");
            }
            if (followup.contact) {
                parts.push(
                    <a
                        key="contact"
                        className="underline"
                        href={`/contacts/${followup.contact.id}`}
                    >
                        {(followup.contact.firstName ?? "") + " " +
                            (followup.contact.lastName ?? "")}
                    </a>,
                );
            }
            if (followup.contact && followup.company) {
                parts.push(" / ");
            }
            if (followup.company) {
                parts.push(
                    <a
                        key="company"
                        className="underline"
                        href={`/customers/${followup.company.id}`}
                    >
                        {followup.company.name}
                    </a>,
                );
            }
            return <span>· Om: {parts}</span>;
        }

        return entityRef ? <>· Om: {entityRef}</> : null;
    }

    if (variant === "action") {
        return (
            <div className="p-3 relative">
                <div className="flex items-center justify-between mb-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                        {showBadge && (
                            <Badge variant="secondary">Oppfølging</Badge>
                        )}
                        <div className="flex-1 min-w-0">
                            <span
                                className="px-1 rounded"
                                style={dueBgStyle(followup.dueAt)}
                            >
                                Frist:{" "}
                                {formatDateTimeWithoutSeconds(followup.dueAt)}
                            </span>
                            {followup.createdBy && (
                                <>
                                    {" "}· Laget av:{" "}
                                    {followup.createdBy.firstName ?? ""}{" "}
                                    {followup.createdBy.lastName ?? ""}
                                </>
                            )}
                            {renderEntityReference()}
                        </div>
                    </div>
                    <button
                        className="inline-flex items-center rounded border px-2 py-0.5 text-xs hover:bg-muted"
                        onClick={() => onComplete?.(followup.id)}
                        disabled={isCompleted}
                    >
                        Fullfør
                    </button>
                </div>
                <div className="whitespace-pre-wrap text-sm pr-8">
                    {followup.note}
                </div>
                {followup.assignedTo && (
                    <div className="absolute bottom-2 right-4">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Avatar className="size-6">
                                    <AvatarFallback className="text-[10px]">
                                        {getInitials(
                                            followup.assignedTo.firstName,
                                            followup.assignedTo.lastName,
                                        )}
                                    </AvatarFallback>
                                </Avatar>
                            </TooltipTrigger>
                            <TooltipContent>
                                Tildelt: {followup.assignedTo.firstName}{" "}
                                {followup.assignedTo.lastName}
                            </TooltipContent>
                        </Tooltip>
                    </div>
                )}
            </div>
        );
    }

    // variant === "completed"
    return (
        <div className="p-3 relative">
            <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2 flex-1 min-w-0 flex-wrap">
                    {showBadge && <Badge variant="secondary">Oppfølging</Badge>}
                    <span className="text-xs text-muted-foreground">
                        {displayDate}
                        {followup.createdBy && (
                            <>
                                {" "}
                                · Laget av: {followup.createdBy.firstName ?? ""}
                                {" "}
                                {followup.createdBy.lastName ?? ""}
                            </>
                        )}
                        {renderEntityReference()}
                    </span>
                </div>
                <div className="flex items-center gap-1.5 text-green-600 text-xs">
                    <CheckIcon className="h-4 w-4" />
                    <span>Fullført</span>
                </div>
            </div>
            <div className="whitespace-pre-wrap text-sm pr-8">
                {followup.note}
            </div>
            {followup.assignedTo && (
                <div className="absolute bottom-2 right-4">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Avatar className="size-6">
                                <AvatarFallback className="text-[10px]">
                                    {getInitials(
                                        followup.assignedTo.firstName,
                                        followup.assignedTo.lastName,
                                    )}
                                </AvatarFallback>
                            </Avatar>
                        </TooltipTrigger>
                        <TooltipContent>
                            Tildelt: {followup.assignedTo.firstName}{" "}
                            {followup.assignedTo.lastName}
                        </TooltipContent>
                    </Tooltip>
                </div>
            )}
        </div>
    );
}
