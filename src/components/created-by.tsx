'use client'

type CreatedByProps = {
  createdAt: string | Date
  createdBy?: { firstName?: string | null; lastName?: string | null } | null
  className?: string
}

export function CreatedBy({ createdAt, createdBy, className }: CreatedByProps) {
  const fullName =
    [createdBy?.firstName, createdBy?.lastName].filter(Boolean).join(' ').trim() || null
  const ts = new Date(createdAt)
  const formatted = isNaN(ts.getTime()) ? '' : ts.toLocaleString()
  return (
    <div className={className ?? 'text-xs text-muted-foreground mt-4'}>
      {fullName ? `Opprettet av ${fullName} ${formatted}` : `Opprettet ${formatted}`}
    </div>
  )
}
