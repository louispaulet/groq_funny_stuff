import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, test } from 'vitest'
import ImageGeneratorNav from './ImageGeneratorNav'

describe('ImageGeneratorNav', () => {
  test('renders generator and gallery links', () => {
    render(
      <MemoryRouter initialEntries={['/imagegen']}>
        <ImageGeneratorNav />
      </MemoryRouter>
    )

    expect(screen.getByRole('link', { name: /generator/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /gallery/i })).toBeInTheDocument()
  })
})
