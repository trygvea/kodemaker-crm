import { NextRequest, NextResponse } from 'next/server'
import { getContactCounts } from '@/db/contacts'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: idStr } = await params
  const id = Number(idStr)
  if (!id) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })

  try {
    const counts = await getContactCounts(id)
    return NextResponse.json(counts)
  } catch (error) {
    console.error('Error getting contact counts:', error)
    return NextResponse.json({ error: 'Failed to get contact counts' }, { status: 500 })
  }
}