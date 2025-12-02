"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import useSWR from "swr";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import {
  BadgePercent,
  Building2,
  ClipboardList,
  History,
  List,
  Mail,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { CreateNewMenu } from "@/components/create-new-menu";

function NavLink({
  href,
  label,
  icon: Icon,
  active,
}: {
  href: string;
  label: string;
  icon: LucideIcon;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-2 rounded px-3 py-2 text-sm hover:bg-muted ${
        active ? "bg-muted font-semibold" : "text-foreground/80"
      }`}
    >
      <Icon className="h-4 w-4" />
      <span>{label}</span>
    </Link>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const companyMatch = pathname?.match(/^\/customers\/(\d+)$/);
  const companyIdFromPath = companyMatch ? Number(companyMatch[1]) : undefined;
  const { data: companyData } = useSWR<
    { company: { id: number; name: string } }
  >(
    companyIdFromPath ? `/api/companies/${companyIdFromPath}` : null,
  );
  const contactMatch = pathname?.match(/^\/contacts\/(\d+)$/);
  const contactIdFromPath = contactMatch ? Number(contactMatch[1]) : undefined;
  const { data: contactData } = useSWR<{
    contact: { id: number; firstName: string; lastName: string };
    currentCompany: { id: number; name: string } | null;
  }>(contactIdFromPath ? `/api/contacts/${contactIdFromPath}` : null);
  const headerCompanyId = companyIdFromPath ?? contactData?.currentCompany?.id;
  const headerCompanyName = companyData?.company?.name ??
    contactData?.currentCompany?.name;
  const headerContactId = contactIdFromPath ?? undefined;
  const headerContactName = contactData
    ? `${contactData.contact.firstName} ${contactData.contact.lastName}`
    : undefined;
  const isActive = (p: string) => pathname === p;
  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-64 shrink-0 border-r bg-card">
      <div className="p-3 space-y-3">
        <CreateNewMenu
          companyId={headerCompanyId}
          companyName={headerCompanyName}
          contactId={headerContactId}
          contactName={headerContactName}
        />
        <div className="space-y-1">
          <NavLink
            href="/events"
            label="Hendelseslogg"
            icon={History}
            active={pathname === "/events"}
          />
          <NavLink
            href="/followups"
            label="Oppfølgninger"
            icon={ClipboardList}
            active={pathname === "/followups"}
          />
          <NavLink
            href="/contacts"
            label="Kontakter"
            icon={List}
            active={pathname === "/contacts"}
          />
          <NavLink
            href="/customers"
            label="Organisasjoner"
            icon={List}
            active={isActive("/customers")}
          />
          <NavLink
            href="/leads/active"
            label="Aktive leads"
            icon={BadgePercent}
            active={pathname === "/leads/active"}
          />
        </div>
        <Separator className="my-2" />
        <NavLink
          href="/mail"
          label="E-post"
          icon={Mail}
          active={pathname === "/mail"}
        />
      </div>
    </aside>
  );
}

export function MobileSidebar() {
  const pathname = usePathname();
  return (
    <TooltipProvider>
      <div className="flex lg:hidden items-center gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              href="/events"
              className={`p-2 rounded ${
                pathname === "/events" ? "bg-muted" : ""
              }`}
            >
              <History className="h-5 w-5" />
            </Link>
          </TooltipTrigger>
          <TooltipContent>Hendelser</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              href="/followups"
              className={`p-2 rounded ${
                pathname === "/followups" ? "bg-muted" : ""
              }`}
            >
              <ClipboardList className="h-5 w-5" />
            </Link>
          </TooltipTrigger>
          <TooltipContent>Oppfølgninger</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              href="/contacts"
              className={`p-2 rounded ${
                pathname === "/contacts" || pathname?.startsWith("/contacts/")
                  ? "bg-muted"
                  : ""
              }`}
            >
              <List className="h-5 w-5" />
            </Link>
          </TooltipTrigger>
          <TooltipContent>Kontakter</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              href="/customers"
              className={`p-2 rounded ${
                pathname === "/customers" ? "bg-muted" : ""
              }`}
            >
              <Building2 className="h-5 w-5" />
            </Link>
          </TooltipTrigger>
          <TooltipContent>Organisasjoner</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              href="/leads/1"
              className={`p-2 rounded ${
                pathname?.startsWith("/leads/") ? "bg-muted" : ""
              }`}
            >
              <BadgePercent className="h-5 w-5" />
            </Link>
          </TooltipTrigger>
          <TooltipContent>Lead</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              href="/mail"
              className={`p-2 rounded ${
                pathname === "/mail" ? "bg-muted" : ""
              }`}
            >
              <Mail className="h-5 w-5" />
            </Link>
          </TooltipTrigger>
          <TooltipContent>E-post</TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}

export function SidebarSheetContent() {
  const pathname = usePathname();
  const companyMatch = pathname?.match(/^\/customers\/(\d+)$/);
  const companyIdFromPath = companyMatch ? Number(companyMatch[1]) : undefined;
  const { data: companyData } = useSWR<
    { company: { id: number; name: string } }
  >(
    companyIdFromPath ? `/api/companies/${companyIdFromPath}` : null,
  );
  const contactMatch = pathname?.match(/^\/contacts\/(\d+)$/);
  const contactIdFromPath = contactMatch ? Number(contactMatch[1]) : undefined;
  const { data: contactData } = useSWR<{
    contact: { id: number; firstName: string; lastName: string };
    currentCompany: { id: number; name: string } | null;
  }>(contactIdFromPath ? `/api/contacts/${contactIdFromPath}` : null);
  const headerCompanyId = companyIdFromPath ?? contactData?.currentCompany?.id;
  const headerCompanyName = companyData?.company?.name ??
    contactData?.currentCompany?.name;
  const headerContactId = contactIdFromPath ?? undefined;
  const headerContactName = contactData
    ? `${contactData.contact.firstName} ${contactData.contact.lastName}`
    : undefined;
  const isActive = (p: string) => pathname === p;
  return (
    <div className="p-3">
      <div className="mb-3">
        <CreateNewMenu
          companyId={headerCompanyId}
          companyName={headerCompanyName}
          contactId={headerContactId}
          contactName={headerContactName}
        />
      </div>
      <NavLink
        href="/events"
        label="Hendelseslogg"
        icon={History}
        active={pathname === "/events"}
      />
      <NavLink
        href="/customers"
        label="Organisasjoner"
        icon={List}
        active={isActive("/customers")}
      />
      <NavLink
        href="/contacts"
        label="Kontakter"
        icon={List}
        active={pathname === "/contacts"}
      />
      <NavLink
        href="/followups"
        label="Oppfølgninger"
        icon={ClipboardList}
        active={pathname === "/followups"}
      />
      <NavLink
        href="/leads/active"
        label="Aktive leads"
        icon={BadgePercent}
        active={pathname === "/leads/active"}
      />
      <Separator className="my-2" />
      <NavLink
        href="/mail"
        label="E-post"
        icon={Mail}
        active={pathname === "/mail"}
      />
    </div>
  );
}
