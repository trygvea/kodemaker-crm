"use client"
import Link from 'next/link'
import Image from 'next/image'
import { NewCompanyDialog } from '@/components/customers/new-company-dialog'
import { NewContactDialog } from '@/components/customers/new-contact-dialog'
import { NewLeadDialog } from '@/components/customers/new-lead-dialog'
import { usePathname } from 'next/navigation'
import useSWR from 'swr'

export function AppHeader() {
  const pathname = usePathname()
  const match = pathname?.match(/^\/customers\/(\d+)$/)
  const companyId = match ? Number(match[1]) : undefined
  const { data: companyData } = useSWR<{ company: { id: number; name: string } }>(companyId ? `/api/companies/${companyId}` : null)
  const companyName = companyData?.company?.name
  const contactMatch = pathname?.match(/^\/contacts\/(\d+)$/)
  const contactId = contactMatch ? Number(contactMatch[1]) : undefined
  const { data: contactData } = useSWR<{ contact: { id: number; firstName: string; lastName: string }; currentCompany: { id: number; name: string } | null }>(
    contactId ? `/api/contacts/${contactId}` : null
  )
  const headerCompanyId = companyId ?? contactData?.currentCompany?.id
  const headerCompanyName = companyName ?? contactData?.currentCompany?.name
  const headerContactId = contactId ?? undefined
  const headerContactName = contactData ? `${contactData.contact.firstName} ${contactData.contact.lastName}` : undefined
  return (
    <header className="sticky top-0 z-40 border-b bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 text-white">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative h-8 w-8">
            <Image src="/next.svg" alt="Logo" fill className="invert drop-shadow" />
          </div>
          <Link href="/" className="font-semibold tracking-wide">Kodemaker CReMa</Link>
        </div>
        <nav className="flex items-center gap-2">
          <Link href="/customers" className="rounded bg-white/15 hover:bg-white/25 px-3 py-1.5 text-sm">Kundeliste</Link>
          <NewCompanyDialog />
          <NewContactDialog />
          <NewLeadDialog companyId={headerCompanyId} companyName={headerCompanyName} contactId={headerContactId} contactName={headerContactName} />
        </nav>
      </div>
    </header>
  )
}


