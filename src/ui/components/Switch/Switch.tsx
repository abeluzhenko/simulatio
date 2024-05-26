import React, { FC } from 'react'
import './Switch.css'

type Props = { value: boolean; onChange: (value: boolean) => void }

export const Switch: FC<Props> = ({ value, onChange }) => {
  const handleChange = () => onChange(!value)

  return (
    <label className="Switch">
      <input
        className="Switch"
        type="checkbox"
        checked={value}
        onChange={handleChange}
      />
      <span className="Switch__slider"></span>
    </label>
  )
}
