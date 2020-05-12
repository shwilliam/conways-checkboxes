import React, {useEffect, useRef, useState} from 'react'

const STEP_DURATION = 400 // ms

const neighborCoords = [
  [-1, -1],
  [-1, 0],
  [-1, 1],
  [0, -1],
  [0, 1],
  [1, -1],
  [1, 0],
  [1, 1],
]

const generateCells = (cols, rows) =>
  Array.from({length: rows}, _ => Array.from({length: cols}, _ => false))

const GameOfLife = ({cols, rows}) => {
  const [cells, setCells] = useState(generateCells(cols, rows))
  const cellsRef = useRef(cells)
  const stepRef = useRef()

  const [isRunning, setIsRunning] = useState(false)
  const onCellActivate = (path, value) => {
    if (!isRunning) {
      setCells(s => {
        const cellsCopy = [...s]
        cellsCopy[path[0]][path[1]] = value
        return cellsCopy
      })
    }
  }

  const startSimulation = _ => setIsRunning(true)
  const resetSimulation = _ => {
    setIsRunning(false)
    stepRef.current = undefined
    setCells(generateCells(cols, rows))
  }

  const step = () => {
    stepRef.current = setTimeout(() => {
      if (stepRef.current) {
        const cellsCopy = [...cellsRef.current]
        const updatedCells = cellsCopy.map((row, rowIdx) =>
          row.map((alive, colIdx) => {
            const aliveNeighbors = neighborCoords.reduce((total, [x, y]) => {
              const neighborRowIdx = rowIdx + y
              const neighborColIdx = colIdx + x

              if (
                neighborColIdx < 0 ||
                neighborColIdx >= cols ||
                neighborRowIdx < 0 ||
                neighborRowIdx >= rows
              )
                return total

              const isAlive = cellsCopy[neighborRowIdx][neighborColIdx]

              return isAlive ? total + 1 : total
            }, 0)

            if (alive && [2, 3].includes(aliveNeighbors)) return true
            if (!alive && aliveNeighbors === 3) return true
            return false
          }),
        )

        setCells(updatedCells)
        step()
      }
    }, STEP_DURATION)
  }

  useEffect(() => {
    if (isRunning && !stepRef?.current) {
      step()
    }
  }, [isRunning])

  useEffect(() => {
    cellsRef.current = cells
  }, [cells])

  return (
    <section>
      {cells.map((row, rowIdx) => (
        <div key={rowIdx}>
          {row.map((alive, columnIdx) => (
            <Cell
              key={`${rowIdx}${columnIdx}`}
              alive={alive}
              path={[rowIdx, columnIdx]}
              onChange={onCellActivate}
            />
          ))}
        </div>
      ))}

      {isRunning ? (
        <button onClick={resetSimulation}>Reset</button>
      ) : (
        <button onClick={startSimulation}>Simulate</button>
      )}
    </section>
  )
}

const Cell = ({alive, path, onChange}) => {
  const handleChange = e => onChange(path, e.target.checked)

  return <input type="checkbox" checked={alive} onChange={handleChange} />
}

export const App = () => (
  <>
    <header className="header">
      <h1>Conway's Checkboxes</h1>

      <blockquote cite="https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life">
        <ul>
          <li>Any live cell with two or three live neighbours survives.</li>
          <li>Any dead cell with three live neighbours becomes a live cell.</li>
          <li>All other live cells die in the next generation.</li>
          <li>Similarly, all other dead cells stay dead.</li>
        </ul>
        <footer>
          — Wikipedia, <cite>Conway's Game of Life</cite>
        </footer>
      </blockquote>
    </header>

    <main className="main">
      <GameOfLife cols={20} rows={20} />
    </main>
  </>
)
