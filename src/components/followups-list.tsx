"use client";
import useSWR from "swr";
import { FollowupItem as FollowupItemComponent } from "@/components/activity-log/followup-item";
import type { FollowupItemData } from "@/components/activity-log/followup-item";

// Export type for backward compatibility
export type FollowupItem = FollowupItemData;

export function FollowupsList({
  endpoint,
  onCompleted,
}: {
  endpoint: string;
  onCompleted?: () => void;
}) {
  const { data, mutate } = useSWR<FollowupItemData[]>(endpoint);

  if (!data) {
    return <div className="p-3 text-sm text-muted-foreground">Laster…</div>;
  }

  return (
    <div className="border rounded divide-y mt-3">
      {data.length
        ? (
          data.map((f) => (
            <FollowupItemComponent
              key={f.id}
              followup={f}
              variant="action"
              showBadge={false}
              entityLinks={true}
              onComplete={async (id: number) => {
                await fetch(`/api/followups/${id}`, { method: "PATCH" });
                await mutate();
                onCompleted?.();
              }}
            />
          ))
        )
        : <div className="p-3 text-sm text-muted-foreground">Ingen</div>}
    </div>
  );
}
