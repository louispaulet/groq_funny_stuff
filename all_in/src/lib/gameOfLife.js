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

export const GAME_OF_LIFE_PRESETS = [
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
