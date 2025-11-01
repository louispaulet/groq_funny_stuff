import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, test } from 'vitest'
import AppShell from './AppShell'
import { ThemeProvider } from '../../theme'
import { experiences } from '../../config/experiences'

function renderShell(children = <div data-testid="content" />) {
  return render(
    <ThemeProvider>
      <MemoryRouter>
        <AppShell>{children}</AppShell>
      </MemoryRouter>
    </ThemeProvider>
  )
}

describe('AppShell', () => {
  test('renders global chrome and children', () => {
    renderShell()
    expect(screen.getByText(/Groq AllIn Studio/i)).toBeInTheDocument()
    expect(screen.getByTestId('content')).toBeInTheDocument()
    expect(screen.getByTitle('Toggle theme')).toBeInTheDocument()
    expect(screen.getByTitle('Profile options')).toBeInTheDocument()
  })

  test('renders experience shortcuts in header nav', () => {
    renderShell()
    const [headerNav] = screen.getAllByRole('navigation')
    const visibleLabels = experiences
      .filter((experience) =>
        ![
          'objectmaker',
          'stlviewer',
          'sixdegrees',
          'imagegen',
          'svglab',
          'flagfoundry',
          'pizzamaker',
          'carmaker',
          'pokedex',
          'mermaidstudio',
          'pongshowdown',
        ].includes(experience.id)
      )
      .map((exp) => exp.navLabel ?? exp.name)

    visibleLabels.forEach((label) => {
      expect(screen.getAllByRole('link', { name: label })).not.toHaveLength(0)
    })

    expect(headerNav).not.toHaveTextContent(/Object Maker/i)
  })

  test('renders footer links', () => {
    renderShell()
    expect(screen.getAllByRole('link', { name: /overview/i })).not.toHaveLength(0)
    expect(screen.getAllByRole('link', { name: /about/i })).not.toHaveLength(0)
  })
})
