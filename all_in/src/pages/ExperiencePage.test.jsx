import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, test } from 'vitest'
import ExperiencePage from './ExperiencePage'

const baseExperience = {
  id: 'demo',
  name: 'Demo Experience',
  badge: 'Badge',
  headline: 'Headline text',
  description: 'Description copy',
  heroGradient: 'from-slate-500 to-slate-700',
}

afterEach(() => {
  cleanup()
})

describe('ExperiencePage', () => {
  test('renders hero copy and children', () => {
    render(
      <ExperiencePage experience={baseExperience}>
        <div data-testid="child">child</div>
      </ExperiencePage>
    )

    expect(screen.getByRole('heading', { name: /demo experience/i })).toBeInTheDocument()
    expect(screen.getByText('Headline text')).toBeInTheDocument()
    expect(screen.getByText('Description copy')).toBeInTheDocument()
    expect(screen.getByTestId('child')).toBeInTheDocument()
  })

  test('renders navigation when provided', () => {
    render(
      <ExperiencePage
        experience={baseExperience}
        navigation={<nav data-testid="nav">navigation</nav>}
      >
        <span>content</span>
      </ExperiencePage>
    )

    expect(screen.getByTestId('nav')).toBeInTheDocument()
  })

  test('uses custom hero content when provided', () => {
    const CustomHero = () => <p data-testid="custom-hero">custom</p>
    render(
      <ExperiencePage
        experience={{ ...baseExperience, heroContent: CustomHero }}
      >
        <span>content</span>
      </ExperiencePage>
    )

    expect(screen.getByTestId('custom-hero')).toBeInTheDocument()
    expect(screen.queryAllByText('Headline text')).toHaveLength(0)
  })

  test('renders fallback when experience is missing', () => {
    render(<ExperiencePage experience={null} />)
    expect(screen.getByText(/experience not found/i)).toBeInTheDocument()
  })
})
