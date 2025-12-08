"use client";
import { Badge } from "@/components/ui/badge";
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
import { CompletionCheckbox } from "@/components/completion-checkbox";

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
    onClick?: () => void;
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
    onClick,
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
                        onClick={(e) => e.stopPropagation()}
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
                        onClick={(e) => e.stopPropagation()}
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
                        onClick={(e) => e.stopPropagation()}
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
            <div
                className="p-3 relative cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={onClick}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        onClick?.();
                    }
                }}
            >
                <div className="flex items-start gap-3">
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="flex-shrink-0"
                    >
                        <CompletionCheckbox
                            completed={isCompleted}
                            onClick={() => {
                                if (!isCompleted) {
                                    onComplete?.(followup.id);
                                }
                            }}
                            disabled={isCompleted}
                        />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2.5 text-xs text-muted-foreground">
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                                <div className="flex-1 min-w-0">
                                    <span
                                        className="rounded"
                                        style={dueBgStyle(followup.dueAt)}
                                    >
                                        Frist: {formatDateTimeWithoutSeconds(
                                            followup.dueAt,
                                        )}
                                    </span>
                                    {followup.createdBy && (
                                        <>
                                            {" "}· Laget av:{" "}
                                            {followup.createdBy.firstName ??
                                                ""}{" "}
                                            {followup.createdBy.lastName ?? ""}
                                        </>
                                    )}
                                    {renderEntityReference()}
                                </div>
                            </div>
                            {showBadge && (
                                <Badge variant="secondary">Oppfølging</Badge>
                            )}
                        </div>
                        <div className="whitespace-pre-wrap text-sm">
                            {followup.note}
                        </div>
                    </div>
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
        <div
            className="p-3 relative cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={onClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onClick?.();
                }
            }}
        >
            <div className="flex items-start gap-3">
                <div
                    onClick={(e) => e.stopPropagation()}
                    className="flex-shrink-0"
                >
                    <CompletionCheckbox
                        completed={true}
                        onClick={() => {}}
                        disabled={true}
                    />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2.5 text-xs text-muted-foreground">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                            <div className="flex-1 min-w-0">
                                <span className="text-xs text-muted-foreground">
                                    {displayDate}
                                    {followup.createdBy && (
                                        <>
                                            {" "}
                                            · Laget av:{" "}
                                            {followup.createdBy.firstName ?? ""}
                                            {" "}
                                            {followup.createdBy.lastName ?? ""}
                                        </>
                                    )}
                                    {renderEntityReference()}
                                </span>
                            </div>
                        </div>
                        {showBadge && (
                            <Badge variant="secondary">Oppfølging</Badge>
                        )}
                    </div>
                    <div className="whitespace-pre-wrap text-sm">
                        {followup.note}
                    </div>
                </div>
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
