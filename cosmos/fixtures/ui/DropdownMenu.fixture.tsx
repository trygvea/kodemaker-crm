import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default {
  default: (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">Handlinger</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Lead</DropdownMenuLabel>
        <DropdownMenuItem>Åpne</DropdownMenuItem>
        <DropdownMenuItem>Rediger</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuCheckboxItem checked>Marker som aktiv</DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem>Marker som tapt</DropdownMenuCheckboxItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};
