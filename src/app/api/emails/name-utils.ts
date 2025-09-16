export function capitalizeNamePart(value: string): string {
  const v = value.trim()
  if (!v) return ''
  return v
    .split('-')
    .map((seg) => (seg ? seg[0].toUpperCase() + seg.slice(1).toLowerCase() : ''))
    .join('-')
}

export function deriveNamesFromEmailLocalPart(local: string): {
  firstName: string
  lastName: string
} {
  const base = local.split('+')[0]
  const parts = base.split('.')
  if (parts.length >= 2) {
    const first = capitalizeNamePart(parts[0])
    const last = capitalizeNamePart(parts[parts.length - 1])
    return { firstName: first, lastName: last }
  }
  const only = capitalizeNamePart(base)
  return { firstName: only, lastName: '' }
}
