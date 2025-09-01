"use client"
import Link from 'next/link'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'

type Crumb = { label: string; href?: string }

export function PageBreadcrumbs({ items }: { items: Crumb[] }) {
  if (!items?.length) return null
  return (
    <div className="mx-auto max-w-6xl px-4 py-3">
      <Breadcrumb>
        <BreadcrumbList>
          {items.map((c, idx) => (
            <>
              <BreadcrumbItem key={`${c.label}-${idx}`}>
                {c.href ? (
                  <BreadcrumbLink asChild>
                    <Link href={c.href}>{c.label}</Link>
                  </BreadcrumbLink>
                ) : (
                  <BreadcrumbPage>{c.label}</BreadcrumbPage>
                )}
              </BreadcrumbItem>
              {idx < items.length - 1 ? <BreadcrumbSeparator /> : null}
            </>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  )
}


