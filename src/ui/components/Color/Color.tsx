import React, { useState, useEffect, FC } from 'react'
import './Color.css'
import { Range } from '../Range/Range'
import { mapRange } from '../../../math/common'

interface Props {
  value: string
  onChange: (rgbaString: string) => void
}

interface RGBA {
  r: number
  g: number
  b: number
  a: number
}

const FALLBACK_COLOR: RGBA = { r: 0, g: 0, b: 0, a: 1 }

export function parseRGBA(
  rgbaString: string,
  fallback: RGBA = FALLBACK_COLOR,
): RGBA {
  const rgbaRegex = /^rgba\((\d+),\s*(\d+),\s*(\d+),\s*(\d*\.?\d+)\)$/
  const match = rgbaString.match(rgbaRegex)
  if (match) {
    return {
      r: parseInt(match[1], 10),
      g: parseInt(match[2], 10),
      b: parseInt(match[3], 10),
      a: parseFloat(match[4]),
    }
  }
  return fallback
}

function toRGBAString(color: RGBA): string {
  return `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`
}

/*
 * @todo:
 * * refactor using integer values
 * *
 */
export const Color: FC<Props> = ({ value, onChange }) => {
  const [color, setColor] = useState<RGBA>(parseRGBA(value, FALLBACK_COLOR))
  const [isFolded, setIsFolded] = useState(true)

  const handleChange = (name: keyof RGBA, value: number) => {
    setColor((prevColor) => ({
      ...prevColor,
      [name]: value,
    }))
  }

  useEffect(() => {
    onChange(toRGBAString(color))
  }, [color, onChange])

  const toggleFold = () => {
    setIsFolded((prevFolded) => !prevFolded)
  }

  return (
    <div className="Color">
      <button
        type="button"
        className="Color__preview"
        style={{
          backgroundColor: `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`,
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
              value={color.r}
              onChange={(value) => handleChange('r', value)}
            />
          </div>
          <div className="UI__option">
            <span className="Option__title">G</span>
            <Range
              min={0}
              max={255}
              value={color.g}
              onChange={(value) => handleChange('g', value)}
            />
          </div>
          <div className="UI__option">
            <span className="Option__title">B</span>
            <Range
              min={0}
              max={255}
              value={color.b}
              onChange={(value) => handleChange('b', value)}
            />
          </div>
          <div className="UI__option">
            <span className="Option__title">A</span>
            <Range
              min={0}
              max={100}
              step={1}
              value={color.a * 100}
              onChange={(value) =>
                handleChange('a', mapRange(value, 0, 100, 0, 1))
              }
            />
          </div>
        </div>
      )}
    </div>
  )
}
