"use client";

import * as React from "react";
import { CalendarIcon } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type DatePickerProps = {
  value?: Date | null;
  onValueChange?: (date: Date | undefined | null) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  align?: "start" | "center" | "end";
};

export function DatePicker({
  value,
  onValueChange,
  placeholder = "Velg dato",
  disabled = false,
  className,
  align = "start",
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !value && "text-muted-foreground",
            className,
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value ? formatDate(value.toISOString()) : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align={align}>
        <Calendar
          mode="single"
          selected={value ?? undefined}
          onSelect={(date) => {
            onValueChange?.(date);
            setOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
