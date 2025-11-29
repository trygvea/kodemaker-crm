import { FollowupsList, FollowupItem } from '@/components/followups-list'

const MOCK_FOLLOWUPS: FollowupItem[] = [
  {
    id: 1,
    note: 'Følg opp tilbud sendt til Kodemaker.',
    dueAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    createdBy: { firstName: 'Ola', lastName: 'Nordmann' },
    company: { id: 1, name: 'Kodemaker' },
    contact: { id: 5, firstName: 'Kari', lastName: 'Nordmann' },
  },
  {
    id: 2,
    note: 'Ring kunden og avklar neste steg.',
    dueAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
]

function MockFollowupsList() {
  // We bypass SWR by mocking the fetch response globally for this endpoint.
  if (typeof window !== 'undefined') {
    // @ts-expect-error - attach mock data for Cosmos
    window.__COSMOS_FOLLOWUPS__ = MOCK_FOLLOWUPS
  }

  return <FollowupsList endpoint="/api/followups?mock=1" />
}

export default {
  default: <MockFollowupsList />,
}


