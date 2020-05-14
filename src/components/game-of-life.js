import React, {useEffect, useRef, useState} from 'react'
import {Cell} from './index'
import {generateCells, neighborCoords} from '../utils'

const STEP_DURATION = 400 // ms

export const GameOfLife = ({cols, rows}) => {
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
  const stopSimulation = _ => {
    setIsRunning(false)
    stepRef.current = undefined
  }
  const resetSimulation = _ => {
    stopSimulation()
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
    <section className="cell-grid">
      <button onClick={isRunning ? stopSimulation : startSimulation}>
        {isRunning ? 'Stop' : 'Simulate'}
      </button>
      <button onClick={resetSimulation}>Reset</button>

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
