import { PageBreadcrumbs } from '@/components/page-breadcrumbs'

export default {
  customer: (
    <PageBreadcrumbs
      items={[
        { label: 'Organisasjoner', href: '/customers' },
        { label: 'Kodemaker', href: '/customers/1' },
        { label: 'Detaljer' },
      ]}
    />
  ),
}


