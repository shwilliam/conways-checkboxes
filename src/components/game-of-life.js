import React, {useEffect, useLayoutEffect, useRef, useState} from 'react'
import {FixedSizeGrid} from 'react-window'
import AutoSizer from 'react-virtualized-auto-sizer'
import {Cell} from './index'
import {generateCells, neighborCoords, preventDefault} from '../utils'

const STEP_DURATION = 400 // ms

export const GameOfLife = () => {
  const [boardSize, setBoardSize] = useState(
    window.innerWidth > 700
      ? [40, 25]
      : window.innerWidth > 450
      ? [30, 25]
      : [25, 25],
  )
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

  useLayoutEffect(() => {
    setCells(generateCells(...boardSize))
    resetSimulation()
  }, [boardSize])

  return (
    <section className="cell-grid__container">
      <header className="cell-grid__header">
        <form onSubmit={preventDefault} className="cell-grid__actions">
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
        </form>

        <p className="cell-grid__info">(scroll to see more)</p>
      </header>

      <AutoSizer>
        {({height, width}) => (
          <FixedSizeGrid
            columnCount={boardSize[0]}
            columnWidth={20}
            height={height}
            rowCount={boardSize[1]}
            rowHeight={20}
            width={width}
            className="cell-grid"
          >
            {({columnIndex, rowIndex, style}) => (
              <div style={style}>
                <Cell
                  key={`${rowIndex}${columnIndex}`}
                  alive={
                    cells[rowIndex] && cells[rowIndex][columnIndex]
                      ? cells[rowIndex][columnIndex]
                      : false
                  }
                  path={[rowIndex, columnIndex]}
                  onChange={onCellActivate}
                />
              </div>
            )}
          </FixedSizeGrid>
        )}
      </AutoSizer>
    </section>
  )
}
