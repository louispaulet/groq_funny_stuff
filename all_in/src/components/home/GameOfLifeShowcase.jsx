import { useEffect, useMemo, useState } from 'react'

const ROWS = 22
const COLS = 44

const PRESET_DEFINITIONS = [
  {
    name: 'Gosper Loop Garden',
    description: 'A classic glider gun keeps launching ships that wrap around the toroidal edge.',
    cells: [
      [5, 1],
      [5, 2],
      [6, 1],
      [6, 2],
      [5, 11],
      [6, 11],
      [7, 11],
      [4, 12],
      [3, 13],
      [3, 14],
      [8, 12],
      [9, 13],
      [9, 14],
      [6, 15],
      [4, 16],
      [8, 16],
      [5, 17],
      [6, 17],
      [7, 17],
      [6, 18],
      [3, 21],
      [4, 21],
      [5, 21],
      [3, 22],
      [4, 22],
      [5, 22],
      [2, 23],
      [6, 23],
      [1, 25],
      [2, 25],
      [6, 25],
      [7, 25],
      [3, 35],
      [4, 35],
      [3, 36],
      [4, 36],
    ],
  },
  {
    name: 'Pulsar Observatory',
    description: 'Twin pulsars breathe in sync while stabilizers keep the rhythm steady.',
    cells: [
      [2, 8],
      [2, 9],
      [2, 10],
      [2, 14],
      [2, 15],
      [2, 16],
      [4, 6],
      [4, 11],
      [4, 13],
      [4, 18],
      [5, 6],
      [5, 11],
      [5, 13],
      [5, 18],
      [6, 6],
      [6, 11],
      [6, 13],
      [6, 18],
      [7, 8],
      [7, 9],
      [7, 10],
      [7, 14],
      [7, 15],
      [7, 16],
      [9, 8],
      [9, 9],
      [9, 10],
      [9, 14],
      [9, 15],
      [9, 16],
      [10, 6],
      [10, 11],
      [10, 13],
      [10, 18],
      [11, 6],
      [11, 11],
      [11, 13],
      [11, 18],
      [12, 6],
      [12, 11],
      [12, 13],
      [12, 18],
      [14, 8],
      [14, 9],
      [14, 10],
      [14, 14],
      [14, 15],
      [14, 16],
      [16, 8],
      [16, 9],
      [16, 10],
      [16, 14],
      [16, 15],
      [16, 16],
      [3, 24],
      [3, 25],
      [4, 24],
      [4, 25],
      [13, 24],
      [13, 25],
      [14, 24],
      [14, 25],
    ],
  },
  {
    name: 'Spaceship Carousel',
    description: 'Four lightweight spaceships chase each other on a seamless neon grid.',
    cells: [
      [2, 3],
      [2, 4],
      [3, 2],
      [4, 2],
      [5, 2],
      [5, 5],
      [2, 5],
      [3, 6],
      [4, 6],
      [5, 6],
      [16, 10],
      [16, 11],
      [15, 12],
      [14, 12],
      [13, 12],
      [13, 9],
      [16, 9],
      [15, 8],
      [14, 8],
      [13, 8],
      [6, 30],
      [6, 31],
      [7, 32],
      [7, 33],
      [7, 34],
      [8, 29],
      [9, 29],
      [9, 34],
      [8, 35],
      [6, 34],
      [12, 20],
      [12, 21],
      [11, 22],
      [11, 23],
      [11, 24],
      [10, 19],
      [9, 19],
      [9, 24],
      [10, 25],
      [12, 24],
    ],
  },
]

function centerPattern(cells) {
  if (!cells.length) {
    return cells
  }

  const rows = cells.map(([row]) => row)
  const cols = cells.map(([, col]) => col)

  const minRow = Math.min(...rows)
  const maxRow = Math.max(...rows)
  const minCol = Math.min(...cols)
  const maxCol = Math.max(...cols)

  const patternHeight = maxRow - minRow + 1
  const patternWidth = maxCol - minCol + 1

  const rowOffset = Math.floor((ROWS - patternHeight) / 2) - minRow
  const colOffset = Math.floor((COLS - patternWidth) / 2) - minCol

  return cells.map(([row, col]) => [row + rowOffset, col + colOffset])
}

const PRESETS = PRESET_DEFINITIONS.map((preset) => ({
  ...preset,
  cells: centerPattern(preset.cells),
}))

const neighborOffsets = [
  [-1, -1],
  [-1, 0],
  [-1, 1],
  [0, -1],
  [0, 1],
  [1, -1],
  [1, 0],
  [1, 1],
]

function createEmptyGrid() {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(0))
}

function applyPreset(preset) {
  const grid = createEmptyGrid()
  preset.cells.forEach(([row, col]) => {
    const safeRow = (row + ROWS) % ROWS
    const safeCol = (col + COLS) % COLS
    grid[safeRow][safeCol] = 1
  })
  return grid
}

function evolveGrid(grid) {
  return grid.map((row, rowIndex) =>
    row.map((cell, colIndex) => {
      const neighbors = neighborOffsets.reduce((sum, [rowOffset, colOffset]) => {
        const neighborRow = (rowIndex + rowOffset + ROWS) % ROWS
        const neighborCol = (colIndex + colOffset + COLS) % COLS
        return sum + grid[neighborRow][neighborCol]
      }, 0)

      if (cell) {
        return neighbors === 2 || neighbors === 3 ? 1 : 0
      }

      return neighbors === 3 ? 1 : 0
    })
  )
}

export default function GameOfLifeShowcase() {
  const initialPresetIndex = useMemo(
    () => Math.floor(Math.random() * PRESETS.length),
    []
  )

  const [activePresetIndex, setActivePresetIndex] = useState(initialPresetIndex)
  const [grid, setGrid] = useState(() => applyPreset(PRESETS[initialPresetIndex]))
  const [generation, setGeneration] = useState(0)

  useEffect(() => {
    setGrid(applyPreset(PRESETS[activePresetIndex]))
    setGeneration(0)
  }, [activePresetIndex])

  useEffect(() => {
    const interval = window.setInterval(() => {
      setGrid((current) => evolveGrid(current))
      setGeneration((current) => current + 1)
    }, 260)

    return () => {
      window.clearInterval(interval)
    }
  }, [])

  const handleShufflePreset = () => {
    setActivePresetIndex((current) => {
      const nextIndex = (current + 1) % PRESETS.length
      return nextIndex
    })
  }

  const activePreset = PRESETS[activePresetIndex]

  return (
    <section className="relative overflow-hidden rounded-[2.75rem] border border-slate-200 bg-slate-900/95 px-6 py-8 text-white shadow-xl transition hover:shadow-2xl dark:border-slate-700 sm:px-10 sm:py-12">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.35),_transparent_55%)]" aria-hidden />
      <div className="relative z-10 space-y-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-3">
            <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-sky-200">
              🧬 Ambient Simulation
            </p>
            <h2 className="text-2xl font-semibold sm:text-3xl">Life Loop Observatory</h2>
            <p className="max-w-2xl text-sm text-slate-200">
              Watch a Conway&apos;s Game of Life preset evolve inside a neon matrix. Each pattern loops on an endless torus grid so spaceships keep flying and oscillators breathe for hundreds of generations.
            </p>
          </div>
          <button
            type="button"
            onClick={handleShufflePreset}
            className="inline-flex items-center gap-2 self-start rounded-full bg-white/15 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-white/25"
          >
            Reset &amp; Shuffle Pattern
            <span aria-hidden>↻</span>
          </button>
        </div>

        <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-slate-900 via-slate-900/80 to-slate-800 p-6 shadow-lg">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(14,116,144,0.35),_transparent_70%)]" aria-hidden />
          <div className="relative z-10 flex flex-col items-center gap-4">
            <div
              className="grid gap-[3px] rounded-2xl border border-white/5 bg-slate-900/80 p-4 shadow-inner"
              style={{
                gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))`,
              }}
            >
              {grid.map((row, rowIndex) =>
                row.map((cell, colIndex) => (
                  <div
                    key={`${rowIndex}-${colIndex}`}
                    className={`h-3 w-3 rounded-[0.45rem] transition-all duration-300 sm:h-4 sm:w-4 ${
                      cell
                        ? 'bg-sky-300 shadow-[0_0_8px_rgba(125,211,252,0.7)]'
                        : 'bg-white/5'
                    }`}
                  />
                ))
              )}
            </div>
            <div className="flex flex-wrap items-center justify-center gap-4 text-xs uppercase tracking-[0.35em] text-slate-300">
              <span className="rounded-full border border-white/20 px-3 py-1 font-semibold">
                Preset · {activePreset.name}
              </span>
              <span className="rounded-full border border-white/10 px-3 py-1 font-semibold">
                Generation {generation.toLocaleString()}
              </span>
            </div>
            <p className="max-w-2xl text-center text-xs text-slate-300/80">
              {activePreset.description}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
