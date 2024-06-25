import React, { FC, ChangeEvent } from 'react'

type Props = {
  value: string
  onChange: (value: string) => void
}

export const Color: FC<Props> = ({ value, onChange }) => {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value)
  }

  return (
    <div className="Color">
      <input type="text" value={value} onChange={handleChange} />
    </div>
  )
}
