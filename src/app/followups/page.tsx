"use client";
import { useState } from "react";
import { FollowupsList } from "@/components/followups-list";
import {
  RadioGroup,
  RadioGroupItem,
  RadioGroupLabel,
} from "@/components/ui/radio-group";

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
          <RadioGroup
            value={mode}
            onValueChange={(value) => setMode(value as "mine" | "all")}
            className="flex items-center gap-4"
          >
            <div className="flex items-center gap-1.5">
              <RadioGroupItem value="mine" id="mine" />
              <RadioGroupLabel htmlFor="mine" className="cursor-pointer">
                Mine
              </RadioGroupLabel>
            </div>
            <div className="flex items-center gap-1.5">
              <RadioGroupItem value="all" id="all" />
              <RadioGroupLabel htmlFor="all" className="cursor-pointer">
                Alle
              </RadioGroupLabel>
            </div>
          </RadioGroup>
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
