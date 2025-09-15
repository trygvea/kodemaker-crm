'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import useSWR from 'swr'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Separator } from '@/components/ui/separator'
import { Building2, Users2, BadgePercent, Mail, List, History } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { NewCompanyDialog } from '@/components/customers/new-company-dialog'
import { NewContactDialog } from '@/components/customers/new-contact-dialog'
import { NewLeadDialog } from '@/components/customers/new-lead-dialog'

function NavLink({
  href,
  label,
  icon: Icon,
  active,
}: {
  href: string
  label: string
  icon: LucideIcon
  active: boolean
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-2 rounded px-3 py-2 text-sm hover:bg-muted ${active ? 'bg-muted font-semibold' : 'text-foreground/80'}`}
    >
      <Icon className="h-4 w-4" />
      <span>{label}</span>
    </Link>
  )
}

export function Sidebar() {
  const pathname = usePathname()
  const companyMatch = pathname?.match(/^\/customers\/(\d+)$/)
  const companyIdFromPath = companyMatch ? Number(companyMatch[1]) : undefined
  const { data: companyData } = useSWR<{ company: { id: number; name: string } }>(
    companyIdFromPath ? `/api/companies/${companyIdFromPath}` : null
  )
  const contactMatch = pathname?.match(/^\/contacts\/(\d+)$/)
  const contactIdFromPath = contactMatch ? Number(contactMatch[1]) : undefined
  const { data: contactData } = useSWR<{
    contact: { id: number; firstName: string; lastName: string }
    currentCompany: { id: number; name: string } | null
  }>(contactIdFromPath ? `/api/contacts/${contactIdFromPath}` : null)
  const headerCompanyId = companyIdFromPath ?? contactData?.currentCompany?.id
  const headerCompanyName = companyData?.company?.name ?? contactData?.currentCompany?.name
  const headerContactId = contactIdFromPath ?? undefined
  const headerContactName = contactData
    ? `${contactData.contact.firstName} ${contactData.contact.lastName}`
    : undefined
  const isActive = (p: string) => pathname === p
  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-64 shrink-0 border-r bg-card">
      <div className="p-3">
        <NavLink href="/customers" label="Kundeliste" icon={List} active={isActive('/customers')} />
        <NavLink
          href="/leads/active"
          label="Aktive leads"
          icon={BadgePercent}
          active={pathname === '/leads/active'}
        />
        <div className="py-1">
          <NewCompanyDialog
            trigger={
              <button className="flex items-center gap-2 rounded px-3 py-2 text-sm hover:bg-muted text-foreground/80">
                <Building2 className="h-4 w-4" />
                <span>Ny kunde</span>
              </button>
            }
          />
        </div>
        <div className="py-1">
          <NewContactDialog
            companyId={headerCompanyId}
            companyName={headerCompanyName}
            trigger={
              <button className="flex items-center gap-2 rounded px-3 py-2 text-sm hover:bg-muted text-foreground/80">
                <Users2 className="h-4 w-4" />
                <span>Ny kontakt</span>
              </button>
            }
          />
        </div>
        <div className="py-1">
          <NewLeadDialog
            companyId={headerCompanyId}
            companyName={headerCompanyName}
            contactId={headerContactId}
            contactName={headerContactName}
            trigger={
              <button className="flex items-center gap-2 rounded px-3 py-2 text-sm hover:bg-muted text-foreground/80">
                <BadgePercent className="h-4 w-4" />
                <span>Ny lead</span>
              </button>
            }
          />
        </div>
        <Separator className="my-2" />
        <NavLink
          href="/hendelseslogg"
          label="Hendelseslogg"
          icon={History}
          active={pathname === '/hendelseslogg'}
        />
        <NavLink href="/mail" label="E-post" icon={Mail} active={pathname === '/mail'} />
      </div>
    </aside>
  )
}

export function MobileSidebar() {
  const pathname = usePathname()
  return (
    <TooltipProvider>
      <div className="flex lg:hidden items-center gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              href="/customers"
              className={`p-2 rounded ${pathname === '/customers' ? 'bg-muted' : ''}`}
            >
              <Building2 className="h-5 w-5" />
            </Link>
          </TooltipTrigger>
          <TooltipContent>Kunde</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              href="/contacts/1"
              className={`p-2 rounded ${pathname?.startsWith('/contacts/') ? 'bg-muted' : ''}`}
            >
              <Users2 className="h-5 w-5" />
            </Link>
          </TooltipTrigger>
          <TooltipContent>Kontakt</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              href="/leads/1"
              className={`p-2 rounded ${pathname?.startsWith('/leads/') ? 'bg-muted' : ''}`}
            >
              <BadgePercent className="h-5 w-5" />
            </Link>
          </TooltipTrigger>
          <TooltipContent>Lead</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Link href="/mail" className={`p-2 rounded ${pathname === '/mail' ? 'bg-muted' : ''}`}>
              <Mail className="h-5 w-5" />
            </Link>
          </TooltipTrigger>
          <TooltipContent>E-post</TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  )
}

export function SidebarSheetContent() {
  const pathname = usePathname()
  const companyMatch = pathname?.match(/^\/customers\/(\d+)$/)
  const companyIdFromPath = companyMatch ? Number(companyMatch[1]) : undefined
  const { data: companyData } = useSWR<{ company: { id: number; name: string } }>(
    companyIdFromPath ? `/api/companies/${companyIdFromPath}` : null
  )
  const contactMatch = pathname?.match(/^\/contacts\/(\d+)$/)
  const contactIdFromPath = contactMatch ? Number(contactMatch[1]) : undefined
  const { data: contactData } = useSWR<{
    contact: { id: number; firstName: string; lastName: string }
    currentCompany: { id: number; name: string } | null
  }>(contactIdFromPath ? `/api/contacts/${contactIdFromPath}` : null)
  const headerCompanyId = companyIdFromPath ?? contactData?.currentCompany?.id
  const headerCompanyName = companyData?.company?.name ?? contactData?.currentCompany?.name
  const headerContactId = contactIdFromPath ?? undefined
  const headerContactName = contactData
    ? `${contactData.contact.firstName} ${contactData.contact.lastName}`
    : undefined
  const isActive = (p: string) => pathname === p
  return (
    <div className="p-3">
      <NavLink href="/customers" label="Kundeliste" icon={List} active={isActive('/customers')} />
      <NavLink
        href="/leads/active"
        label="Aktive leads"
        icon={BadgePercent}
        active={pathname === '/leads/active'}
      />
      <div className="py-1">
        <NewCompanyDialog
          trigger={
            <button className="flex items-center gap-2 rounded px-3 py-2 text-sm hover:bg-muted text-foreground/80">
              <Building2 className="h-4 w-4" />
              <span>Ny kunde</span>
            </button>
          }
        />
      </div>
      <div className="py-1">
        <NewContactDialog
          companyId={headerCompanyId}
          companyName={headerCompanyName}
          trigger={
            <button className="flex items-center gap-2 rounded px-3 py-2 text-sm hover:bg-muted text-foreground/80">
              <Users2 className="h-4 w-4" />
              <span>Ny kontakt</span>
            </button>
          }
        />
      </div>
      <div className="py-1">
        <NewLeadDialog
          companyId={headerCompanyId}
          companyName={headerCompanyName}
          contactId={headerContactId}
          contactName={headerContactName}
          trigger={
            <button className="flex items-center gap-2 rounded px-3 py-2 text-sm hover:bg-muted text-foreground/80">
              <BadgePercent className="h-4 w-4" />
              <span>Ny lead</span>
            </button>
          }
        />
      </div>
      <Separator className="my-2" />
      <NavLink
        href="/hendelseslogg"
        label="Hendelseslogg"
        icon={History}
        active={pathname === '/hendelseslogg'}
      />
      <NavLink href="/mail" label="E-post" icon={Mail} active={pathname === '/mail'} />
    </div>
  )
}
