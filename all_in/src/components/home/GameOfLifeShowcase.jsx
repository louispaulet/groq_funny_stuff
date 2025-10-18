import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { applyPreset, evolveGrid, GAME_OF_LIFE_PRESETS } from '../../lib/gameOfLife'

const ROWS = 22
const COLS = 44
const SIMULATION_INTERVAL_MS = 260

export default function GameOfLifeShowcase() {
  const initialPresetIndex = useMemo(
    () => Math.floor(Math.random() * GAME_OF_LIFE_PRESETS.length),
    []
  )

  const [activePresetIndex, setActivePresetIndex] = useState(initialPresetIndex)
  const [grid, setGrid] = useState(() =>
    applyPreset(GAME_OF_LIFE_PRESETS[initialPresetIndex], ROWS, COLS)
  )
  const [generation, setGeneration] = useState(0)

  useEffect(() => {
    setGrid(applyPreset(GAME_OF_LIFE_PRESETS[activePresetIndex], ROWS, COLS))
    setGeneration(0)
  }, [activePresetIndex])

  useEffect(() => {
    const interval = window.setInterval(() => {
      setGrid((current) => evolveGrid(current))
      setGeneration((current) => current + 1)
    }, SIMULATION_INTERVAL_MS)

    return () => {
      window.clearInterval(interval)
    }
  }, [])

  const handleShufflePreset = () => {
    setActivePresetIndex((current) => {
      const nextIndex = (current + 1) % GAME_OF_LIFE_PRESETS.length
      return nextIndex
    })
  }

  const activePreset = GAME_OF_LIFE_PRESETS[activePresetIndex]

  return (
    <section className="relative overflow-hidden rounded-[2.5rem] border border-slate-200 bg-slate-900/95 px-6 py-7 text-white shadow-xl transition hover:shadow-2xl dark:border-slate-700 sm:px-10 sm:py-10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.35),_transparent_55%)]" aria-hidden />
      <div className="relative z-10 space-y-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-2">
            <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-sky-200">
              🧬 Ambient Simulation
            </p>
            <h2 className="text-2xl font-semibold sm:text-3xl">Life Loop Observatory</h2>
            <p className="max-w-2xl text-sm text-slate-200">
              Watch a Conway&apos;s Game of Life preset evolve on a toroidal grid. Ready for custom dimensions or speed ramps? Hop into the Game of Life Lab for hands-on controls.
            </p>
          </div>
          <div className="flex flex-col gap-2 self-start sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={handleShufflePreset}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-white/12 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white shadow-sm transition hover:bg-white/20"
            >
              Reset &amp; Shuffle Pattern
              <span aria-hidden>↻</span>
            </button>
            <Link
              to="/game-of-life-lab"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-sky-400 px-5 py-2 text-sm font-semibold text-slate-900 shadow-lg transition hover:bg-sky-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 focus-visible:ring-sky-200"
            >
              Launch Game of Life Lab
              <span aria-hidden>→</span>
            </Link>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-[2.25rem] border border-white/10 bg-gradient-to-br from-slate-900 via-slate-900/80 to-slate-800 p-5 shadow-lg">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(14,116,144,0.3),_transparent_70%)]" aria-hidden />
          <div className="relative z-10 flex flex-col items-center gap-3">
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
                Gen {generation.toLocaleString()}
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
