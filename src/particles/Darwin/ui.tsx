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
  const [absorbRate, setAbsorbRate] = useState(defaultConfig.absorbRate)
  const [massThreshold, setMassThreshold] = useState(
    defaultConfig.massThreshold,
  )
  const [bgColor, setBgColor] = useState(defaultConfig.bgColor)

  useEffect(() => {
    onChange({
      ...defaultConfig,
      count,
      minSpeed,
      maxSpeed,
      maxRadius,
      minRadius,
      absorbRate,
      massThreshold,
      bgColor,
    })
  }, [
    minSpeed,
    maxSpeed,
    maxRadius,
    minRadius,
    absorbRate,
    massThreshold,
    bgColor,
  ])

  useEffect(() => {
    onChange({
      ...defaultConfig,
      count,
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
            max={defaultConfig.maxRadius}
            step={0.1}
            onChange={(value) => setMaxRadius(value)}
          />
        </div>
        <div className="UI__option">
          <span className="Option__title">Min Radius</span>
          <Number
            value={minRadius}
            min={defaultConfig.minRadius}
            max={defaultConfig.maxRadius}
            step={0.1}
            onChange={(value) => setMinRadius(value)}
          />
        </div>
        <div className="UI__option">
          <span className="Option__title">Absorb Rate</span>
          <Number
            value={absorbRate}
            min={0}
            max={1}
            step={0.01}
            onChange={(value) => setAbsorbRate(value)}
          />
        </div>
        <div className="UI__option">
          <span className="Option__title">Mass Threshold</span>
          <Number
            value={massThreshold}
            min={0}
            max={100}
            step={1}
            onChange={(value) => setMassThreshold(value)}
          />
        </div>
        <div className="UI__option">
          <span className="Option__title">BG Color</span>
          <Color value={bgColor} onChange={(value) => setBgColor(value)} />
        </div>
      </div>
    </div>
  )
}
