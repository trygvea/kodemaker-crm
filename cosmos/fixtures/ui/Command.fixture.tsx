import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

export default {
  default: (
    <Command className="w-80">
      <CommandInput placeholder="Søk etter organisasjon..." />
      <CommandList>
        <CommandEmpty>Ingen treff.</CommandEmpty>
        <CommandGroup heading="Forslag">
          <CommandItem>Kodemaker</CommandItem>
          <CommandItem>NRK</CommandItem>
          <CommandItem>Finn</CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  ),
};
