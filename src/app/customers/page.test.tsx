import { render, screen } from '@testing-library/react'
import CustomersPage from './page'

jest.mock('swr', () => ({ __esModule: true, default: () => ({ data: [] }) }))
jest.mock('next/navigation', () => ({
  __esModule: true,
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
  }),
}))

describe('CustomersPage', () => {
  it('renders heading and search field', () => {
    render(<CustomersPage />)
    expect(screen.getByText('Organisasjoner')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Søk i organisasjoner')).toBeInTheDocument()
  })
})
