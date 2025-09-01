import { render, screen } from '@testing-library/react'
import CustomersPage from './page'

jest.mock('swr', () => ({ __esModule: true, default: () => ({ data: [] }) }))

describe('CustomersPage', () => {
  it('renders heading and search field', () => {
    render(<CustomersPage />)
    expect(screen.getByText('Kunder')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Søk i kunder')).toBeInTheDocument()
  })
})


