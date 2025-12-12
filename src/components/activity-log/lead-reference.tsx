"use client";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { getLeadStatusLabel, truncateText } from "@/lib/utils";
import type { LeadStatus } from "@/types/api";
import { useRouter } from "next/navigation";

type LeadReferenceProps = {
  lead: { id: number; description: string; status: LeadStatus };
};

export function LeadReference({ lead }: LeadReferenceProps) {
  const router = useRouter();
  return (
    <div className="-mt-0.5 mb-2.5 text-xs text-muted-foreground">
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            className="cursor-pointer hover:underline"
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/leads/${lead.id}`);
            }}
          >
            {getLeadStatusLabel(lead.status)}: {truncateText(lead.description, 50)}
          </span>
        </TooltipTrigger>
        <TooltipContent>
          <p>{lead.description}</p>
        </TooltipContent>
      </Tooltip>
    </div>
  );
}
