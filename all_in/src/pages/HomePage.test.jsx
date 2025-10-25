import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, test, vi } from 'vitest'
import HomePage from './HomePage'
import { experiences } from '../config/experiences'

vi.mock('../components/home/GameOfLifeShowcase', () => ({
  __esModule: true,
  default: () => <div data-testid="game-of-life-showcase">showcase</div>,
}))

describe('HomePage', () => {
  test('lists all experiences with entry links', () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    )

    const indexSection = document.getElementById('experience-index')
    expect(indexSection).not.toBeNull()

    experiences.forEach((experience) => {
      const headings = within(indexSection).getAllByRole('heading', { name: experience.name })
      expect(headings.length).toBeGreaterThan(0)
      const card = headings[0].closest('article')
      expect(card).not.toBeNull()
      expect(within(card).getByRole('link', { name: /enter/i })).toBeInTheDocument()
    })

    expect(screen.getByTestId('game-of-life-showcase')).toBeInTheDocument()
  })
})
