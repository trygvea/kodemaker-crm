import { render, screen, act, waitFor } from '@testing-library/react'
import EventsPage from './page'
import React from 'react'

jest.useFakeTimers()

const mockUseSWR = jest.fn()
jest.mock('swr', () => ({ __esModule: true, default: (cb: any) => mockUseSWR(cb) }))

describe('EventsPage SSE highlight', () => {
  beforeEach(() => {
    mockUseSWR.mockReset()
  })

  it('does not highlight initial items, highlights SSE items then removes after 10s', async () => {
    const initial = [
      {
        id: 2,
        entity: 'contact',
        entityId: 1,
        description: 'Init two',
        createdAt: new Date().toISOString(),
      },
      {
        id: 1,
        entity: 'contact',
        entityId: 1,
        description: 'Init one',
        createdAt: new Date().toISOString(),
      },
    ]
    mockUseSWR.mockReturnValue({ data: initial })

    const esInstances: any[] = []
    const OriginalES = (global as any).EventSource
    ;(global as any).EventSource = class {
      url: string
      onmessage?: (ev: any) => void
      onerror?: (ev: any) => void
      constructor(url: string) {
        this.url = url
        esInstances.push(this)
      }
      close() {}
    }

    try {
      const { container } = render(<EventsPage />)

      // Initial items should render and not be highlighted
      expect(screen.getByText('Init two')).toBeInTheDocument()
      const initAnchor = screen.getByText('Init two').closest('a')!
      expect(initAnchor?.className).not.toContain('bg-green-50')

      // Simulate SSE push of a newer event
      const newEvent = {
        id: 3,
        entity: 'contact',
        entityId: 2,
        description: 'Live event',
        createdAt: new Date().toISOString(),
      }
      // Trigger message
      expect(esInstances.length).toBeGreaterThan(0)
      await act(async () => {
        esInstances[0].onmessage?.({ data: JSON.stringify(newEvent) })
      })

      const liveAnchor = await screen.findByText('Live event')
      const liveRow = liveAnchor.closest('a')!
      expect(liveRow.className).toContain('bg-green-50')

      // After 10s highlight is removed
      await act(async () => {
        jest.advanceTimersByTime(10000)
      })
      await waitFor(() => {
        const updated = screen.getByText('Live event').closest('a')!
        expect(updated.className).not.toContain('bg-green-50')
      })
    } finally {
      ;(global as any).EventSource = OriginalES
    }
  })
})
