import React, { useState, useEffect, FC } from 'react'
import './Color.css'
import { Range } from '../Range/Range'
import {
  colorToRGBA,
  getRed,
  getBlue,
  getGreen,
  getAlpha,
  setRed,
  setGreen,
  setBlue,
  setAlpha,
} from '../../../math/Color'

interface Props {
  value: number
  onChange: (value: number) => void
}

export const Color: FC<Props> = ({ value: initialValue, onChange }) => {
  const [color, setColor] = useState(initialValue ?? 0x0)
  const [isFolded, setIsFolded] = useState(true)

  useEffect(() => {
    onChange(color)
  }, [color])

  const toggleFold = () => {
    setIsFolded((prevFolded) => !prevFolded)
  }

  return (
    <div className="Color">
      <button
        type="button"
        className="Color__preview"
        style={{
          backgroundColor: colorToRGBA(color),
        }}
        onClick={toggleFold}
      />
      {!isFolded && (
        <div className="Color__sliders UI__group">
          <div className="UI__option">
            <span className="Option__title">R</span>
            <Range
              min={0}
              max={255}
              value={getRed(color)}
              onChange={(value) => setColor(setRed(color, value))}
            />
          </div>
          <div className="UI__option">
            <span className="Option__title">G</span>
            <Range
              min={0}
              max={255}
              value={getGreen(color)}
              onChange={(value) => setColor(setGreen(color, value))}
            />
          </div>
          <div className="UI__option">
            <span className="Option__title">B</span>
            <Range
              min={0}
              max={255}
              value={getBlue(color)}
              onChange={(value) => setColor(setBlue(color, value))}
            />
          </div>
          <div className="UI__option">
            <span className="Option__title">A</span>
            <Range
              min={0}
              max={255}
              value={getAlpha(color)}
              onChange={(value) => setColor(setAlpha(color, value))}
            />
          </div>
        </div>
      )}
    </div>
  )
}
