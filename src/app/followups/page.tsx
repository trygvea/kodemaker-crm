"use client";
import { useState } from "react";
import { FollowupsList } from "@/components/followups-list";

export default function FollowupsPage() {
  const [mode, setMode] = useState<"mine" | "all">("mine");
  const openEndpoint = mode === "all"
    ? "/api/followups?all=1"
    : "/api/followups";
  const completedEndpoint = mode === "all"
    ? "/api/followups?completed=1&all=1"
    : "/api/followups?completed=1";
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Oppfølgninger</h1>
        <div className="flex items-center gap-4 text-sm">
          <span>Vis:</span>
          <label className="inline-flex items-center gap-1.5">
            <input
              type="radio"
              name="fu-scope"
              value="mine"
              checked={mode === "mine"}
              onChange={() => setMode("mine")}
            />
            Mine
          </label>
          <label className="inline-flex items-center gap-1.5">
            <input
              type="radio"
              name="fu-scope"
              value="all"
              checked={mode === "all"}
              onChange={() => setMode("all")}
            />
            Alle
          </label>
        </div>
      </div>
      <div>
        <FollowupsList endpoint={openEndpoint} />
      </div>
      <div>
        <h2 className="text-lg font-medium mb-2">Fullførte</h2>
        <FollowupsList endpoint={completedEndpoint} variant="completed" />
      </div>
    </div>
  );
}
