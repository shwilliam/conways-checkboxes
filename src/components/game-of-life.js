import React, {useEffect, useRef, useState} from 'react'
import {Cell} from './index'
import {generateCells, neighborCoords} from '../utils'

const STEP_DURATION = 400 // ms

export const GameOfLife = () => {
  const [boardSize, setBoardSize] = useState([10, 10])
  const [cells, setCells] = useState(generateCells(...boardSize))
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
  const stopSimulation = _ => {
    setIsRunning(false)
    stepRef.current = undefined
  }
  const resetSimulation = _ => {
    stopSimulation()
    setCells(generateCells(...boardSize))
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
                neighborColIdx >= boardSize[0] ||
                neighborRowIdx < 0 ||
                neighborRowIdx >= boardSize[1]
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

  const handleColsInputChange = e => {
    const cols = Number(e.target.value)
    setBoardSize(([_, rows]) => [cols, rows])
  }

  const handleRowsInputChange = e => {
    const rows = Number(e.target.value)
    setBoardSize(([cols]) => [cols, rows])
  }

  useEffect(() => {
    if (isRunning && !stepRef?.current) {
      step()
    }
  }, [isRunning])

  useEffect(() => {
    cellsRef.current = cells
  }, [cells])

  useEffect(() => {
    setCells(generateCells(...boardSize))
    resetSimulation()
  }, [boardSize])

  return (
    <section className="cell-grid">
      <button onClick={isRunning ? stopSimulation : startSimulation}>
        {isRunning ? 'Stop' : 'Simulate'}
      </button>

      <button onClick={resetSimulation}>Reset</button>

      <label htmlFor="cols-input" className="visibly-hidden">
        Columns
      </label>
      <input
        id="cols-input"
        name="cols-input"
        className="input"
        value={boardSize[0]}
        onChange={handleColsInputChange}
        type="number"
        min="5"
        step="5"
      />
      <label htmlFor="rows-input" className="visibly-hidden">
        Rows
      </label>
      <input
        id="rows-input"
        name="rows-input"
        className="input"
        value={boardSize[1]}
        onChange={handleRowsInputChange}
        type="number"
        min="5"
        step="5"
      />

      {cells.map((row, rowIdx) => (
        <div key={rowIdx} className="cell-grid__row">
          {row.map((alive, columnIdx) => (
            <Cell
              className="cell-grid__cell"
              key={`${rowIdx}${columnIdx}`}
              alive={alive}
              path={[rowIdx, columnIdx]}
              onChange={onCellActivate}
            />
          ))}
        </div>
      ))}
    </section>
  )
}
