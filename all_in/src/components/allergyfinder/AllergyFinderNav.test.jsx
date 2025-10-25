import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, test } from 'vitest'
import AllergyFinderNav from './AllergyFinderNav'

describe('AllergyFinderNav', () => {
  test('renders links for chat and cookie editor', () => {
    render(
      <MemoryRouter initialEntries={['/allergyfinder']}>
        <AllergyFinderNav />
      </MemoryRouter>
    )

    expect(screen.getByRole('link', { name: /chat assistant/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /allergy cookie editor/i })).toBeInTheDocument()
  })
})
