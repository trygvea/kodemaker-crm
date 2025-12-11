"use client";

import { useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import { Check, Filter, Loader2, User, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";

export type UserFilterValue = "mine" | "all" | number;

export type UserData = {
  id: number;
  firstName: string;
  lastName: string;
};

export interface UserFilterProps {
  value: UserFilterValue;
  onChange: (value: UserFilterValue) => void;
  className?: string;
}

export function UserFilter({ value, onChange, className }: UserFilterProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const { data: users, isLoading } = useSWR<UserData[]>("/api/users");

  const filteredUsers = useMemo(() => {
    if (!users) return [];
    if (!query) return users;
    const lowerQuery = query.toLowerCase();
    return users.filter(
      (u) =>
        u.firstName.toLowerCase().includes(lowerQuery) ||
        u.lastName.toLowerCase().includes(lowerQuery) ||
        `${u.firstName} ${u.lastName}`.toLowerCase().includes(lowerQuery)
    );
  }, [users, query]);

  const selectedUser = useMemo(() => {
    if (typeof value !== "number") return null;
    return users?.find((u) => u.id === value) ?? null;
  }, [users, value]);

  // Reset to "mine" if the selected user no longer exists (e.g., was deleted)
  useEffect(() => {
    if (
      typeof value === "number" &&
      users &&
      !users.some((u) => u.id === value)
    ) {
      onChange("mine");
    }
  }, [value, users, onChange]);

  const displayText = useMemo(() => {
    if (value === "mine") return "Mine";
    if (value === "all") return "Alle";
    if (selectedUser) {
      return `${selectedUser.firstName} ${selectedUser.lastName}`;
    }
    // Show loading indicator while fetching users if a specific user is selected
    if (typeof value === "number" && isLoading) {
      return "Laster...";
    }
    return "Ukjent bruker";
  }, [value, selectedUser, isLoading]);

  const displayIcon = useMemo(() => {
    if (isLoading && typeof value === "number") {
      return <Loader2 className="h-4 w-4 animate-spin" />;
    }
    if (value === "all") return <Users className="h-4 w-4" />;
    return <User className="h-4 w-4" />;
  }, [value, isLoading]);

  const isFiltered = value !== "mine";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-label={`Filter: ${displayText}`}
          disabled={isLoading && !users}
          className={cn(
            "justify-between gap-2",
            isFiltered && "border-primary/50 bg-primary/5",
            className
          )}
        >
          <Filter
            className={cn(
              "h-4 w-4",
              isFiltered ? "text-primary" : "text-muted-foreground"
            )}
            aria-hidden="true"
          />
          <span>{displayText}</span>
          {displayIcon}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[220px] p-0" align="end">
        <Command>
          <CommandInput
            placeholder="Søk bruker..."
            value={query}
            onValueChange={setQuery}
          />
          <CommandList>
            <CommandEmpty>Ingen treff</CommandEmpty>
            <CommandGroup>
              <CommandItem
                value="mine"
                onSelect={() => {
                  onChange("mine");
                  setOpen(false);
                  setQuery("");
                }}
              >
                <User className="mr-2 h-4 w-4" />
                Mine
                <Check
                  className={cn(
                    "ml-auto h-4 w-4",
                    value === "mine" ? "opacity-100" : "opacity-0"
                  )}
                />
              </CommandItem>
              <CommandItem
                value="all"
                onSelect={() => {
                  onChange("all");
                  setOpen(false);
                  setQuery("");
                }}
              >
                <Users className="mr-2 h-4 w-4" />
                Alle
                <Check
                  className={cn(
                    "ml-auto h-4 w-4",
                    value === "all" ? "opacity-100" : "opacity-0"
                  )}
                />
              </CommandItem>
            </CommandGroup>
            {isLoading ? (
              <>
                <CommandSeparator />
                <CommandGroup heading="Brukere">
                  <div className="flex items-center justify-center py-4 text-sm text-muted-foreground">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Laster brukere...
                  </div>
                </CommandGroup>
              </>
            ) : filteredUsers.length > 0 ? (
              <>
                <CommandSeparator />
                <CommandGroup heading="Brukere">
                  {filteredUsers.map((user) => (
                    <CommandItem
                      key={user.id}
                      value={`${user.firstName} ${user.lastName}`}
                      onSelect={() => {
                        onChange(user.id);
                        setOpen(false);
                        setQuery("");
                      }}
                    >
                      {user.firstName} {user.lastName}
                      <Check
                        className={cn(
                          "ml-auto h-4 w-4",
                          value === user.id ? "opacity-100" : "opacity-0"
                        )}
                      />
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            ) : null}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
