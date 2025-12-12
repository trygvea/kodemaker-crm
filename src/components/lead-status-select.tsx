"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type LeadStatus = "NEW" | "IN_PROGRESS" | "LOST" | "WON" | "BORTFALT";

const statusOptions: { value: LeadStatus; label: string }[] = [
  { value: "NEW", label: "Ny" },
  { value: "IN_PROGRESS", label: "Under arbeid" },
  { value: "LOST", label: "Tapt" },
  { value: "WON", label: "Vunnet" },
  { value: "BORTFALT", label: "Bortfalt" },
];

interface LeadStatusSelectProps {
  value: LeadStatus;
  onValueChange: (value: LeadStatus) => void;
  className?: string;
}

export function LeadStatusSelect({
  value,
  onValueChange,
  className,
}: LeadStatusSelectProps) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className={className}>
        <SelectValue placeholder="Velg status" />
      </SelectTrigger>
      <SelectContent>
        {statusOptions.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
