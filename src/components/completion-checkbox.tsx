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
        "peer relative flex items-center justify-center rounded-full border-2 transition-all cursor-pointer",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-50",
        completed
          ? "border-green-600 bg-green-600"
          : "border-muted-foreground/40 bg-transparent hover:border-muted-foreground",
        className,
      )}
      style={{ width: "22px", height: "22px", minWidth: "22px" }}
      aria-label={completed ? "Mark as incomplete" : "Mark as complete"}
      aria-checked={completed}
      role="checkbox"
    >
      {completed
        ? <Check className="h-4 w-4 text-white" strokeWidth={3} />
        : (
          <Check
            className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity peer-hover:opacity-100"
            strokeWidth={2.5}
          />
        )}
      <span className="sr-only">
        {completed ? "Mark as incomplete" : "Mark as complete"}
      </span>
    </button>
  );
}
