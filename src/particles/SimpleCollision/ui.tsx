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
  const [minSpeed, setMinSpeed] = useState(defaultConfig.minSpeed)
  const [maxSpeed, setMaxSpeed] = useState(defaultConfig.maxSpeed)
  const [maxRadius, setMaxRadius] = useState(defaultConfig.maxRadius)
  const [minRadius, setMinRadius] = useState(defaultConfig.minRadius)
  const [density, setDensity] = useState(defaultConfig.density)
  const [bgColor, setBgColor] = useState(defaultConfig.bgColor)

  useEffect(() => {
    onChange({
      ...defaultConfig,
      minSpeed,
      maxSpeed,
      maxRadius,
      minRadius,
      density,
      count,
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
        <span className="Option__title">Max Radius</span>
        <Number
          value={maxRadius}
          min={defaultConfig.minRadius}
          max={100}
          onChange={(value) => setMaxRadius(value)}
        />
      </div>
      <div className="UI__option">
        <span className="Option__title">Min Radius</span>
        <Number
          value={minRadius}
          min={1}
          max={defaultConfig.maxRadius}
          onChange={(value) => setMinRadius(value)}
        />
      </div>
      <div className="UI__option">
        <span className="Option__title">Density</span>
        <Number
          value={density}
          min={0}
          max={1}
          step={0.01}
          onChange={(value) => setDensity(value)}
        />
      </div>
      <div className="UI__option">
        <span className="Option__title">BG Color</span>
        <Color value={bgColor} onChange={(value) => setBgColor(value)} />
      </div>
    </div>
  )
}
