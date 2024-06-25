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
  const [maxSpeed, setMaxSpeed] = useState(defaultConfig.maxSpeed)
  const [minSpeed, setMinSpeed] = useState(defaultConfig.minSpeed)
  const [maxConnections, setMaxConnections] = useState(
    defaultConfig.maxConnections,
  )
  const [range, setRange] = useState(defaultConfig.range)
  const [bgColor, setBgColor] = useState(defaultConfig.bgColor)

  useEffect(() => {
    onChange({
      ...defaultConfig,
      count,
      maxSpeed,
      minSpeed,
      maxConnections,
      range,
      bgColor,
    })
  }, [count])

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
        <span className="Option__title">Min Speed</span>
        <Number
          value={minSpeed}
          min={defaultConfig.minSpeed}
          max={defaultConfig.maxSpeed}
          step={0.1}
          onChange={(value) => setMinSpeed(value)}
        />
      </div>
      <div className="UI__option">
        <span className="Option__title">Max Speed</span>
        <Number
          value={maxSpeed}
          min={defaultConfig.minSpeed}
          max={defaultConfig.maxSpeed}
          step={0.1}
          onChange={(value) => setMaxSpeed(value)}
        />
      </div>
      <div className="UI__option">
        <span className="Option__title">Max Connections</span>
        <Number
          value={maxConnections}
          min={0}
          max={defaultConfig.maxConnections}
          step={100}
          onChange={(value) => setMaxConnections(value)}
        />
      </div>
      <div className="UI__option">
        <span className="Option__title">Range</span>
        <Number
          value={range}
          min={0}
          max={defaultConfig.range}
          step={10}
          onChange={(value) => setRange(value)}
        />
      </div>
      <div className="UI__option">
        <span className="Option__title">BG Color</span>
        <Color value={bgColor} onChange={(value) => setBgColor(value)} />
      </div>
    </div>
  )
}
