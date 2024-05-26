import React, { ChangeEvent, FC } from 'react'
import './Select.css'

type Item = {
  id: string
  value: string
}

type Props = {
  options: Item[]
  value: Item
  onChange: (value: Item) => void
}

export const Select: FC<Props> = ({ options, value, onChange }) => {
  const changeHandler = (e: ChangeEvent<HTMLSelectElement>) => {
    const selected = options.find((option) => option.value === e.target.value)!
    onChange(selected)
  }

  return (
    <div className="Select">
      <select onChange={changeHandler}>
        {options.map((option) => (
          <option key={option.id} selected={option.id === value.id}>
            {option.value}
          </option>
        ))}
      </select>
    </div>
  )
}
