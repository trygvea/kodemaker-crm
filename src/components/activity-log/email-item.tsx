"use client";
import { Badge } from "@/components/ui/badge";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { formatDateTimeWithoutSeconds } from "@/lib/utils";
import type { ApiEmail } from "@/types/api";

type EmailItemProps = {
    email: ApiEmail;
};

export function EmailItem({ email }: EmailItemProps) {
    return (
        <div className="p-3">
            <div className="flex items-start gap-3">
                <div className="flex-shrink-0" style={{ width: "22px" }} />
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2.5 text-xs text-muted-foreground">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                            <div className="flex-1 min-w-0">
                                <span className="text-xs text-muted-foreground">
                                    {formatDateTimeWithoutSeconds(
                                        email.createdAt,
                                    )}
                                    {email.sourceUser && (
                                        <>
                                            {" "}· Avsender:{" "}
                                            {email.sourceUser.firstName ?? ""}
                                            {" "}
                                            {email.sourceUser.lastName ?? ""}
                                        </>
                                    )}
                                    {email.recipientContact && (
                                        <>
                                            {" "}· Mottaker:{" "}
                                            {email.recipientContact.firstName ??
                                                ""}{" "}
                                            {email.recipientContact.lastName ??
                                                ""}
                                        </>
                                    )}
                                </span>
                            </div>
                        </div>
                        <Badge variant="primary">E-post</Badge>
                    </div>
                    <Accordion type="single" collapsible>
                        <AccordionItem
                            value={`email-${email.id}`}
                            className="border-none"
                        >
                            <AccordionTrigger className="group hover:no-underline text-left font-normal py-0 h-auto">
                                <div className="flex-1 min-w-0">
                                    {email.subject && (
                                        <div className="font-medium mb-1 text-sm">
                                            {email.subject}
                                        </div>
                                    )}
                                    <div
                                        className="whitespace-pre-wrap break-all text-sm group-data-[state=open]:hidden"
                                        style={{
                                            maxHeight: "4.5em",
                                            overflow: "hidden",
                                        }}
                                    >
                                        {email.content}
                                    </div>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="pt-0">
                                <div className="whitespace-pre-wrap break-all text-sm">
                                    {email.content}
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </div>
            </div>
        </div>
    );
}
