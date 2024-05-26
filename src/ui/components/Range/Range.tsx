import React, { FC } from 'react'
import './Range.css'

type Props = {
  min: number
  max: number
  value: number
  onChange: (value: number) => void
}

export const Range: FC<Props> = ({ min, max, value, onChange }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(parseInt(e.target.value, 10))
  }

  return (
    <div className="Range">
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={handleChange}
      />
    </div>
  )
}
