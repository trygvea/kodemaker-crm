// Contacts
export type ApiContact = {
  id: number
  firstName: string
  lastName: string
  phone?: string | null
  linkedInUrl?: string | null
}

type ApiCompanyBrief = {
  id: number
  name: string
  startDate?: string | null
  endDate?: string | null
}

export type ApiComment = {
  id: number
  content: string
  createdAt: string
}

export type ApiFollowup = {
  id: number
  note: string
  dueAt: string
  createdBy?: { firstName?: string | null; lastName?: string | null } | null
}

export type ApiLead = {
  id: number
  description: string
  status: 'NEW' | 'IN_PROGRESS' | 'LOST' | 'WON'
}

export type ApiEmail = {
  id: number
  subject?: string | null
  content: string
  createdAt: string
}

export type ApiContactEmail = {
  id: number
  email: string
  active: boolean
  createdAt: string
}

export type GetContactDetailResponse = {
  contact: ApiContact
  currentCompany: ApiCompanyBrief | null
  previousCompanies: ApiCompanyBrief[]
  comments: ApiComment[]
  followups: ApiFollowup[]
  leads: ApiLead[]
  emails: ApiEmail[]
  contactEmails: ApiContactEmail[]
  history: Array<{
    id: number
    startDate: string
    endDate?: string | null
    company: { id: number; name: string }
  }>
}

// Companies
export type ApiCompany = {
  id: number
  name: string
  websiteUrl?: string | null
  emailDomain?: string | null
  contactEmail?: string | null
}

export type GetCompanyDetailResponse = {
  company: ApiCompany
  contacts: Array<{
    id: number
    firstName: string
    lastName: string
    phone?: string | null
    linkedInUrl?: string | null
    emails: string
  }>
  comments: ApiComment[]
  leads: Array<{
    id: number
    status: 'NEW' | 'IN_PROGRESS' | 'LOST' | 'WON'
    description: string
    contactId?: number | null
  }>
}

// Contacts list
export type ListContactsItem = {
  id: number
  firstName: string
  lastName: string
  emails: string
  company?: { id: number; name: string } | null
}
