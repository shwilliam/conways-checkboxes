import React from 'react'

export const Cell = ({alive, path, onChange}) => {
  const handleChange = e => onChange(path, e.target.checked)

  return <input type="checkbox" checked={alive} onChange={handleChange} />
}
