import React, { FC } from 'react'
import './Number.css'

type Props = {
  min: number
  max: number
  value: number
  step?: number
  onChange: (value: number) => void
}
export const Number: FC<Props> = ({ min, max, value, onChange, step = 1 }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(parseInt(e.target.value, 10))
  }
  const updateValue = (update: number) => {
    const newValue = Math.max(Math.min(update, max), min)
    if (newValue !== value) {
      onChange(newValue)
    }
  }

  return (
    <div className="Number">
      <button onClick={() => updateValue(value - step)}>◄</button>
      <input
        type="number"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={handleChange}
      />
      <button onClick={() => updateValue(value + step)}>►</button>
    </div>
  )
}
