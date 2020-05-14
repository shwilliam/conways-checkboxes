export const neighborCoords = [
  [-1, -1],
  [-1, 0],
  [-1, 1],
  [0, -1],
  [0, 1],
  [1, -1],
  [1, 0],
  [1, 1],
]

export const generateCells = (cols, rows) =>
  Array.from({length: rows}, _ => Array.from({length: cols}, _ => false))
