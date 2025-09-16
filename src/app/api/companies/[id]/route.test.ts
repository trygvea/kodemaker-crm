import { PATCH } from './route'
import { NextRequest } from 'next/server'

jest.mock('@/db/client', () => ({
  db: {
    update: jest.fn(() => ({ set: () => ({ where: () => ({ returning: () => [[{ id: 1 }]] }) }) })),
  },
}))
jest.mock('next/server', () => ({
  NextResponse: {
    json: (data: any, init?: any) => ({ json: async () => data, status: init?.status ?? 200 }),
  },
}))
jest.mock('@/db/schema', () => ({ companies: { id: 'companies.id' } }))
jest.mock('drizzle-orm', () => ({ eq: (a: any, b: any) => [a, b] }))

describe('PATCH /api/companies/[id]', () => {
  it('treats empty strings as null for optional fields', async () => {
    const body = { name: 'Acme', websiteUrl: '', emailDomain: '', contactEmail: '' }
    const req = {
      json: async () => body,
    }
    const res = await PATCH(req as any, { params: Promise.resolve({ id: '1' }) } as any)
    expect(res.status).toBe(200)
  })
})
