"use client";
import { Badge } from "@/components/ui/badge";
import { formatDateTimeWithoutSeconds } from "@/lib/utils";

type CommentItemProps = {
    id: number;
    content: string;
    createdAt: string;
    createdBy?: { firstName?: string | null; lastName?: string | null } | null;
    onClick?: () => void;
};

export function CommentItem({
    id,
    content,
    createdAt,
    createdBy,
    onClick,
}: CommentItemProps) {
    return (
        <div
            key={`comment-${id}`}
            className="p-3 cursor-pointer hover:bg-muted/50 transition-colors"
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
                <div className="flex-shrink-0" style={{ width: "22px" }} />
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2.5 text-xs text-muted-foreground">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                            <div className="flex-1 min-w-0">
                                <span className="text-xs text-muted-foreground">
                                    {formatDateTimeWithoutSeconds(createdAt)}
                                    {createdBy && (
                                        <>
                                            {" "}· Laget av:{" "}
                                            {createdBy.firstName ?? ""}{" "}
                                            {createdBy.lastName ?? ""}
                                        </>
                                    )}
                                </span>
                            </div>
                        </div>
                        <Badge variant="secondary">Kommentar</Badge>
                    </div>
                    <div className="whitespace-pre-wrap text-sm">
                        {content}
                    </div>
                </div>
            </div>
        </div>
    );
}
