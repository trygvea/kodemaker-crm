"use client";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

type CompletionCheckboxProps = {
  completed: boolean;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
};

export function CompletionCheckbox({
  completed,
  onClick,
  disabled = false,
  className,
}: CompletionCheckboxProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "group relative flex items-center justify-center rounded-full transition-all",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        disabled
          ? "cursor-default"
          : "cursor-pointer",
        completed
          ? "bg-secondary-green/10"
          : "border-2 border-muted-foreground/40 bg-transparent",
        !disabled && !completed && "hover:border-secondary-green/40 hover:bg-secondary-green/10",
        !disabled && completed && "hover:ring-2 hover:ring-secondary-green/40",
        className
      )}
      style={{ width: "22px", height: "22px", minWidth: "22px" }}
      aria-label={completed ? "Completed" : "Mark as complete"}
      aria-checked={completed}
      role="checkbox"
    >
      {completed ? (
        <Check className="h-4 w-4 text-secondary-green" strokeWidth={3} />
      ) : (
        <Check
          className={cn(
            "h-4 w-4 text-secondary-green opacity-0 transition-opacity",
            !disabled && "group-hover:opacity-100"
          )}
          strokeWidth={2.5}
        />
      )}
      <span className="sr-only">{completed ? "Completed" : "Mark as complete"}</span>
    </button>
  );
}
