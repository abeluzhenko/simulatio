import React, { FC, useEffect, useState } from 'react'
import { Number } from '../../ui/components/Number/Number'
import { Range } from '../../ui/components/Range/Range'
import { Color } from '../../ui/components/Color/Color'
import { mapRange } from '../../math/common'
import { Config } from './config'

type Props = {
  defaultConfig: Config
  onChange: (config: Config) => void
}

export const UI: FC<Props> = ({ onChange, defaultConfig }) => {
  const [count, setCount] = useState(defaultConfig.count)
  const [minRadius, setMinRadius] = useState(defaultConfig.minRadius)
  const [maxRadius, setMaxRadius] = useState(defaultConfig.maxRadius)
  const [forceRadius, setForceRadius] = useState(defaultConfig.forceRadius)
  const [damping, setDamping] = useState(defaultConfig.damping)
  const [gravityForce, setGravityForce] = useState(defaultConfig.gravityForce)
  const [retractionForce, setRetractionForce] = useState(
    defaultConfig.retractionForce,
  )
  const [bgColor, setBgColor] = useState(defaultConfig.bgColor)

  useEffect(() => {
    onChange({
      ...defaultConfig,
      count,
      minRadius,
      maxRadius,
      forceRadius,
      damping,
      gravityForce,
      retractionForce,
      bgColor,
    })
  }, [
    count,
    minRadius,
    maxRadius,
    forceRadius,
    damping,
    gravityForce,
    retractionForce,
    bgColor,
  ])

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
        <span className="Option__title">Min Radius</span>
        <Number
          value={minRadius}
          min={1}
          max={defaultConfig.maxRadius}
          onChange={(value) => setMinRadius(value)}
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
        <span className="Option__title">Force Radius</span>
        <Number
          value={forceRadius}
          min={1}
          max={100}
          onChange={(value) => setForceRadius(value)}
        />
      </div>
      <div className="UI__option">
        <span className="Option__title">Damping</span>
        <Range
          value={damping * 100}
          min={0}
          max={100}
          step={1}
          onChange={(value) => setDamping(mapRange(value, 0, 100, 0, 1))}
        />
      </div>
      <div className="UI__option">
        <span className="Option__title">G Force</span>
        <Range
          value={gravityForce * 100}
          min={0}
          max={100}
          step={1}
          onChange={(value) => setGravityForce(mapRange(value, 0, 100, 0, 1))}
        />
      </div>
      <div className="UI__option">
        <span className="Option__title">R Force</span>
        <Range
          value={retractionForce * 10}
          min={0}
          max={100}
          step={1}
          onChange={(value) =>
            setRetractionForce(mapRange(value, 0, 100, 0, 10))
          }
        />
      </div>

      <div className="UI__option">
        <span className="Option__title">BG Color</span>
        <Color value={bgColor} onChange={(value) => setBgColor(value)} />
      </div>
    </div>
  )
}
