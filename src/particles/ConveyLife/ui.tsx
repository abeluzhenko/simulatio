import React, { FC, useEffect, useState } from 'react'
import { Number } from '../../ui/components/Number/Number'
import { Color } from '../../ui/components/Color/Color'
import { Config } from './config'

type Props = {
  defaultConfig: Config
  onChange: (config: Config) => void
}

export const UI: FC<Props> = ({ onChange, defaultConfig }) => {
  const [count, setCount] = useState(defaultConfig.count)
  const [stepTimeMs, setStepTimeMs] = useState(defaultConfig.stepTimeMs)
  const [borderSize, setBorderSize] = useState(defaultConfig.borderSize)
  const [bgColor, setBgColor] = useState(defaultConfig.bgColor)

  useEffect(() => {
    onChange({
      ...defaultConfig,
      count,
      stepTimeMs,
      borderSize,
      bgColor,
    })
  }, [count, stepTimeMs, borderSize, bgColor])

  return (
    <div className="UI__group">
      <div className="UI__option">
        <span className="Option__title">Count</span>
        <Number
          value={count}
          min={defaultConfig.minCount}
          max={defaultConfig.maxCount}
          step={100}
          onChange={(value) => setCount(value)}
        />
      </div>
      <div className="UI__option">
        <span className="Option__title">Step Time</span>
        <Number
          value={stepTimeMs}
          min={1}
          max={100}
          step={10}
          onChange={(value) => setStepTimeMs(value)}
        />
      </div>
      <div className="UI__option">
        <span className="Option__title">Border Size</span>
        <Number
          value={borderSize}
          min={0}
          max={4}
          step={1}
          onChange={(value) => setBorderSize(value)}
        />
      </div>
      <div className="UI__option">
        <span className="Option__title">BG Color</span>
        <Color value={bgColor} onChange={(value) => setBgColor(value)} />
      </div>
    </div>
  )
}
