import React, { ChangeEvent, FC } from 'react'
import './Select.css'

type Item = {
  id: string
  value: string
}

type Props = {
  options: Readonly<[Item, ...Item[]]>
  value: Item
  onChange: (value: Item) => void
}

export const Select: FC<Props> = ({ options, value, onChange }) => {
  const changeHandler = (e: ChangeEvent<HTMLSelectElement>) => {
    const selected = options.find((option) => option.id === e.target.value)
    if (selected) {
      onChange(selected)
    }
  }

  return (
    <div className="Select">
      <select onChange={changeHandler} value={value.id}>
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.value}
          </option>
        ))}
      </select>
    </div>
  )
}
