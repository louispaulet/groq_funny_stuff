export { GAME_OF_LIFE_PRESETS } from './gameOfLifePresets'

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

export function createEmptyGrid(rows, cols) {
  if (rows <= 0 || cols <= 0) {
    return []
  }
  return Array.from({ length: rows }, () => Array(cols).fill(0))
}

export function centerPattern(cells, rows, cols) {
  if (!Array.isArray(cells) || !cells.length || rows <= 0 || cols <= 0) {
    return []
  }

  const rowValues = cells.map(([row]) => row)
  const colValues = cells.map(([, col]) => col)
  const minRow = Math.min(...rowValues)
  const maxRow = Math.max(...rowValues)
  const minCol = Math.min(...colValues)
  const maxCol = Math.max(...colValues)

  const patternHeight = maxRow - minRow + 1
  const patternWidth = maxCol - minCol + 1

  const rowOffset = Math.floor((rows - patternHeight) / 2) - minRow
  const colOffset = Math.floor((cols - patternWidth) / 2) - minCol

  return cells.map(([row, col]) => [
    ((row + rowOffset) % rows + rows) % rows,
    ((col + colOffset) % cols + cols) % cols,
  ])
}

export function applyPreset(preset, rows, cols, options = {}) {
  const { center = true } = options
  const validRows = Number.isFinite(rows) ? Math.max(0, Math.floor(rows)) : 0
  const validCols = Number.isFinite(cols) ? Math.max(0, Math.floor(cols)) : 0

  if (validRows === 0 || validCols === 0) {
    return []
  }

  const grid = createEmptyGrid(validRows, validCols)
  const presetCells = Array.isArray(preset?.cells) ? preset.cells : []
  const cells = center ? centerPattern(presetCells, validRows, validCols) : presetCells

  cells.forEach(([row, col]) => {
    const wrappedRow = ((row % validRows) + validRows) % validRows
    const wrappedCol = ((col % validCols) + validCols) % validCols
    grid[wrappedRow][wrappedCol] = 1
  })

  return grid
}

export function evolveGrid(grid, options = {}) {
  const { wrap = true } = options
  const rows = grid.length
  if (rows === 0) return []
  const cols = grid[0]?.length ?? 0
  if (cols === 0) return Array.from({ length: rows }, () => [])

  return grid.map((row, rowIndex) =>
    row.map((cell, colIndex) => {
      const neighbors = neighborOffsets.reduce((sum, [rowOffset, colOffset]) => {
        let neighborRow = rowIndex + rowOffset
        let neighborCol = colIndex + colOffset

        if (wrap) {
          neighborRow = (neighborRow + rows) % rows
          neighborCol = (neighborCol + cols) % cols
          return sum + grid[neighborRow][neighborCol]
        }

        if (neighborRow < 0 || neighborRow >= rows || neighborCol < 0 || neighborCol >= cols) {
          return sum
        }

        return sum + grid[neighborRow][neighborCol]
      }, 0)

      if (cell) {
        return neighbors === 2 || neighbors === 3 ? 1 : 0
      }
      return neighbors === 3 ? 1 : 0
    })
  )
}

export function countActiveCells(grid) {
  return grid.reduce(
    (sum, row) => sum + row.reduce((rowSum, cell) => rowSum + (cell ? 1 : 0), 0),
    0
  )
}
