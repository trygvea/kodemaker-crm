import { useState } from "react";
import {
  BadgePercent,
  Building2,
  ChevronRight,
  Plus,
  Users2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NewCompanyDialog } from "@/components/dialogs/new-company-dialog";
import { NewContactDialog } from "@/components/dialogs/new-contact-dialog";
import { NewLeadDialog } from "@/components/dialogs/new-lead-dialog";

export interface CreateNewMenuProps {
  companyId?: number;
  companyName?: string;
  contactId?: number;
  contactName?: string;
}

export function CreateNewMenu({
  companyId,
  companyName,
  contactId,
  contactName,
}: CreateNewMenuProps) {
  const [activeDialog, setActiveDialog] = useState<
    "company" | "contact" | "lead" | null
  >(null);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className="w-full justify-between bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 text-white hover:brightness-110 hover:from-purple-600 hover:via-pink-500 hover:to-orange-400">
            <span className="inline-flex items-center gap-2">
              <Plus className="h-4 w-4" />
              <span>Opprett</span>
            </span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          <DropdownMenuItem
            className="cursor-pointer"
            onSelect={() => setActiveDialog("company")}
          >
            <Building2 className="h-4 w-4" />
            <span>Organisasjon</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="cursor-pointer"
            onSelect={() => setActiveDialog("contact")}
          >
            <Users2 className="h-4 w-4" />
            <span>Kontakt</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="cursor-pointer"
            onSelect={() => setActiveDialog("lead")}
          >
            <BadgePercent className="h-4 w-4" />
            <span>Lead</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <NewCompanyDialog
        trigger={null}
        open={activeDialog === "company"}
        onOpenChange={(isOpen) => {
          if (!isOpen && activeDialog === "company") {
            setActiveDialog(null);
          }
        }}
      />
      <NewContactDialog
        companyId={companyId}
        companyName={companyName}
        trigger={null}
        open={activeDialog === "contact"}
        onOpenChange={(isOpen) => {
          if (!isOpen && activeDialog === "contact") {
            setActiveDialog(null);
          }
        }}
      />
      <NewLeadDialog
        companyId={companyId}
        companyName={companyName}
        contactId={contactId}
        contactName={contactName}
        trigger={null}
        open={activeDialog === "lead"}
        onOpenChange={(isOpen) => {
          if (!isOpen && activeDialog === "lead") {
            setActiveDialog(null);
          }
        }}
      />
    </>
  );
}
