import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, test } from 'vitest'
import ObjectMakerNav from './ObjectMakerNav'

describe('ObjectMakerNav', () => {
  test('renders builder and zoo links', () => {
    render(
      <MemoryRouter initialEntries={['/objectmaker']}>
        <ObjectMakerNav />
      </MemoryRouter>
    )

    expect(screen.getByRole('link', { name: /builder/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /zoo/i })).toBeInTheDocument()
  })
})
