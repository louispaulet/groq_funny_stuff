import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { applyPreset, countActiveCells, evolveGrid, GAME_OF_LIFE_PRESETS } from '../lib/gameOfLife'

const MIN_DIMENSION = 12
const MAX_DIMENSION = 70
const DEFAULT_ROWS = 30
const DEFAULT_COLS = 54
const MIN_SPEED = 80
const MAX_SPEED = 1000
const DEFAULT_SPEED = 260
const SPEED_STEP = 20

function clamp(value, min, max) {
  if (!Number.isFinite(value)) return min
  return Math.min(Math.max(value, min), max)
}

function formatDuration(ms) {
  if (!Number.isFinite(ms)) return ''
  if (ms < 1000) return `${ms} ms`
  return `${(ms / 1000).toFixed(1)} s`
}

export default function GameOfLifeLabPage() {
  const [rows, setRows] = useState(DEFAULT_ROWS)
  const [cols, setCols] = useState(DEFAULT_COLS)
  const [speed, setSpeed] = useState(DEFAULT_SPEED)
  const [isRunning, setIsRunning] = useState(true)
  const [presetIndex, setPresetIndex] = useState(0)
  const [grid, setGrid] = useState(() =>
    applyPreset(GAME_OF_LIFE_PRESETS[0], DEFAULT_ROWS, DEFAULT_COLS)
  )
  const [generation, setGeneration] = useState(0)

  useEffect(() => {
    setGrid(applyPreset(GAME_OF_LIFE_PRESETS[presetIndex], rows, cols))
    setGeneration(0)
  }, [cols, presetIndex, rows])

  useEffect(() => {
    if (!isRunning) return undefined
    const timer = window.setInterval(() => {
      setGrid((current) => evolveGrid(current))
      setGeneration((current) => current + 1)
    }, speed)
    return () => window.clearInterval(timer)
  }, [isRunning, speed])

  const activePreset = GAME_OF_LIFE_PRESETS[presetIndex]
  const aliveCount = useMemo(() => countActiveCells(grid), [grid])
  const surfaceArea = rows * cols
  const aliveRatio = surfaceArea > 0 ? ((aliveCount / surfaceArea) * 100).toFixed(1) : '0.0'

  function handleRowsChange(event) {
    const nextValue = clamp(event.target.valueAsNumber, MIN_DIMENSION, MAX_DIMENSION)
    setRows(nextValue)
  }

  function handleColsChange(event) {
    const nextValue = clamp(event.target.valueAsNumber, MIN_DIMENSION, MAX_DIMENSION)
    setCols(nextValue)
  }

  function handleSpeedChange(event) {
    const nextValue = clamp(event.target.valueAsNumber, MIN_SPEED, MAX_SPEED)
    setSpeed(nextValue)
  }

  function toggleRunning() {
    setIsRunning((current) => !current)
  }

  function handleStep() {
    setGrid((current) => evolveGrid(current))
    setGeneration((current) => current + 1)
  }

  return (
    <div className="space-y-10">
      <header className="relative overflow-hidden rounded-[2.75rem] border border-slate-200 bg-slate-950 px-6 py-10 text-white shadow-xl dark:border-slate-700 sm:px-10">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.28),_transparent_60%)]" aria-hidden />
        <div className="relative z-10 space-y-5">
          <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-sky-200">
            🧪 Game of Life Lab
          </p>
          <div className="space-y-3">
            <h1 className="text-3xl font-semibold sm:text-4xl">Design your own cellular automata experiments</h1>
            <p className="max-w-2xl text-sm text-slate-200">
              Conway&apos;s Game of Life unfolds on an infinite grid where simple rules generate surprising patterns. Dial in a preset, resize the toroidal stage, and control the simulation speed to watch oscillators, spaceships, and glider guns behave under different conditions.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.35em] text-slate-300">
            <span className="rounded-full border border-white/15 px-3 py-1 font-semibold">Toroidal wrap</span>
            <span className="rounded-full border border-white/15 px-3 py-1 font-semibold">Live controls</span>
            <span className="rounded-full border border-white/15 px-3 py-1 font-semibold">Preset seeds</span>
          </div>
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:border-white/30 hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
          >
            Back to landing page
            <span aria-hidden>↺</span>
          </Link>
        </div>
      </header>

      <section className="grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,20rem)]">
        <div className="relative overflow-hidden rounded-[2.5rem] border border-slate-200 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-6 text-slate-100 shadow-xl dark:border-slate-700">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(14,116,144,0.22),_transparent_68%)]" aria-hidden />
          <div className="relative z-10 flex flex-col gap-6">
            <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.35em] text-slate-300">
              <span className="rounded-full border border-white/20 px-3 py-1 font-semibold">
                Generation {generation.toLocaleString()}
              </span>
              <span className="rounded-full border border-white/20 px-3 py-1 font-semibold">
                Alive {aliveCount.toLocaleString()} ({aliveRatio}%)
              </span>
              <span className="rounded-full border border-white/20 px-3 py-1 font-semibold">
                Grid {rows} × {cols}
              </span>
            </div>
            <div
              className="grid w-full gap-[2px] rounded-3xl border border-white/10 bg-slate-950/70 p-4 shadow-inner sm:p-6"
              style={{
                gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
              }}
            >
              {grid.map((row, rowIndex) =>
                row.map((cell, colIndex) => (
                  <div
                    key={`${rowIndex}-${colIndex}`}
                    className={`aspect-square rounded-md transition-all duration-300 ${
                      cell ? 'bg-sky-300 shadow-[0_0_6px_rgba(125,211,252,0.6)]' : 'bg-slate-800'
                    }`}
                  />
                ))
              )}
            </div>
            <div className="space-y-2 text-sm text-slate-300">
              <p className="font-semibold text-slate-100">{activePreset.name}</p>
              <p className="text-slate-300/80">{activePreset.description}</p>
            </div>
          </div>
        </div>

        <aside className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-900/70">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Controls</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Tune the matrix, swap presets, and adjust the simulation clock. Changes reload the grid with a centered seed.
            </p>
            <div className="mt-5 space-y-5">
              <label className="block space-y-2">
                <span className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500 dark:text-slate-400">
                  Starter pattern
                </span>
                <select
                  value={presetIndex}
                  onChange={(event) => setPresetIndex(Number.parseInt(event.target.value, 10) || 0)}
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-sky-400 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
                >
                  {GAME_OF_LIFE_PRESETS.map((preset, index) => (
                    <option key={preset.name} value={index}>
                      {preset.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.35em] text-slate-500 dark:text-slate-400">
                  <span>Rows</span>
                  <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[0.65rem] font-bold text-slate-700 dark:bg-slate-700 dark:text-slate-100">
                    {rows}
                  </span>
                </div>
                <input
                  type="range"
                  min={MIN_DIMENSION}
                  max={MAX_DIMENSION}
                  step={1}
                  value={rows}
                  onChange={handleRowsChange}
                  className="w-full accent-sky-400"
                />
              </label>
              <label className="block space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.35em] text-slate-500 dark:text-slate-400">
                  <span>Columns</span>
                  <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[0.65rem] font-bold text-slate-700 dark:bg-slate-700 dark:text-slate-100">
                    {cols}
                  </span>
                </div>
                <input
                  type="range"
                  min={MIN_DIMENSION}
                  max={MAX_DIMENSION}
                  step={1}
                  value={cols}
                  onChange={handleColsChange}
                  className="w-full accent-sky-400"
                />
              </label>
              <label className="block space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.35em] text-slate-500 dark:text-slate-400">
                  <span>Tick speed</span>
                  <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[0.65rem] font-bold text-slate-700 dark:bg-slate-700 dark:text-slate-100">
                    {formatDuration(speed)}
                  </span>
                </div>
                <input
                  type="range"
                  min={MIN_SPEED}
                  max={MAX_SPEED}
                  step={SPEED_STEP}
                  value={speed}
                  onChange={handleSpeedChange}
                  className="w-full accent-sky-400"
                />
              </label>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={toggleRunning}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
                >
                  {isRunning ? 'Pause' : 'Resume'}
                </button>
                <button
                  type="button"
                  onClick={handleStep}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-sky-400 hover:text-sky-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-200 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:hover:border-sky-400 dark:hover:text-sky-300"
                  disabled={isRunning}
                >
                  Step once
                </button>
              </div>
            </div>
          </div>
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white/70 p-5 text-sm text-slate-600 shadow-sm dark:border-slate-600 dark:bg-slate-900/60 dark:text-slate-300">
            <p>
              Patterns are centered and wrapped on a toroidal grid, mirroring the ambient showcase. Increase the dimensions to
              give glider guns more room to breathe, or slow the clock to analyze oscillator cycles frame-by-frame.
            </p>
          </div>
        </aside>
      </section>
    </div>
  )
}
