"use client";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { ChevronsUpDown } from "lucide-react";
import { truncateText } from "@/lib/utils";
import type { LeadStatus } from "@/types/api";

type Lead = {
  id: number;
  description: string;
  status: LeadStatus;
};

type LeadSelectorProps = {
  leads: Lead[] | undefined;
  selectedLead: Lead | null;
  onSelect: (lead: Lead | null) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  query: string;
  onQueryChange: (query: string) => void;
};

export function LeadSelector({
  leads,
  selectedLead,
  onSelect,
  open,
  onOpenChange,
  query,
  onQueryChange,
}: LeadSelectorProps) {
  return (
    <div>
      <label className="block text-xs text-muted-foreground mb-1">Lead</label>
      <Popover open={open} onOpenChange={onOpenChange}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            className="w-full justify-between text-sm font-normal"
          >
            <span className="truncate flex-1 min-w-0 text-left">
              {selectedLead ? truncateText(selectedLead.description, 60) : "Velg lead…"}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0 w-[var(--radix-popover-trigger-width)]">
          <Command>
            <CommandInput
              autoFocus
              placeholder="Søk lead…"
              value={query}
              onValueChange={onQueryChange}
              onKeyDown={(e) => {
                if (e.key === "Escape" || e.key === "Tab") {
                  onOpenChange(false);
                }
              }}
            />
            <CommandList>
              <CommandEmpty>Ingen treff</CommandEmpty>
              <CommandItem
                value=""
                onSelect={() => {
                  onSelect(null);
                  onOpenChange(false);
                }}
              >
                Ingen
              </CommandItem>
              {leads?.map((l) => (
                <CommandItem
                  key={l.id}
                  value={`${l.id}-${l.description}`}
                  onSelect={() => {
                    onSelect(l);
                    onOpenChange(false);
                  }}
                >
                  {truncateText(l.description, 60)}
                </CommandItem>
              ))}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
