"use client";
import { Badge } from "@/components/ui/badge";
import { formatDateTimeWithoutSeconds } from "@/lib/utils";

type CommentItemProps = {
    id: number;
    content: string;
    createdAt: string;
    createdBy?: { firstName?: string | null; lastName?: string | null } | null;
};

export function CommentItem({
    id,
    content,
    createdAt,
    createdBy,
}: CommentItemProps) {
    return (
        <div key={`comment-${id}`} className="p-3">
            <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="secondary">Kommentar</Badge>
                    <span className="text-xs text-muted-foreground">
                        {formatDateTimeWithoutSeconds(createdAt)}
                        {createdBy && (
                            <>
                                {" "}· Laget av: {createdBy.firstName ?? ""}
                                {" "}
                                {createdBy.lastName ?? ""}
                            </>
                        )}
                    </span>
                </div>
            </div>
            <div className="whitespace-pre-wrap text-sm">{content}</div>
        </div>
    );
}
