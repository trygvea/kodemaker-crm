import { createEvent } from './events'

jest.mock('@/db/client', () => {
  return {
    db: {
      insert: jest.fn(() => ({
        values: () => ({
          returning: () => [{ id: 1, entity: 'contact', entityId: 2, description: 'desc' }],
        }),
      })),
    },
    pool: { query: jest.fn(async () => ({ rows: [] })) },
  }
})

describe('createEvent', () => {
  it('inserts event and notifies listeners', async () => {
    const res = await createEvent('contact' as any, 2, 'desc')
    expect(res).toMatchObject({ id: 1, entity: 'contact', entityId: 2, description: 'desc' })
    const { pool } = jest.requireMock('@/db/client') as any
    expect(pool.query).toHaveBeenCalled()
    const [sql, args] = (pool.query as jest.Mock).mock.calls[0]
    expect(String(sql).toLowerCase()).toContain('pg_notify')
    expect(args[0]).toBe('events')
  })
})
