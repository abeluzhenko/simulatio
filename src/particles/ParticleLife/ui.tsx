import React, { FC, useEffect, useState } from 'react'
import { Number } from '../../ui/components/Number/Number'
import { Range } from '../../ui/components/Range/Range'
import { Color } from '../../ui/components/Color/Color'
import { mapRange } from '../../math/common'
import { colorToRGBA } from '../../math/Color'
import { Config } from './config'
import './ui.css'

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
  const [rules, setRules] = useState(defaultConfig.rules)

  const handleRuleChange = (
    from: keyof Config['rules'],
    to: keyof Config['rules'],
    value: number,
  ) => {
    setRules((prev) => ({
      ...prev,
      [from]: {
        ...prev[from],
        [to]: value,
      },
    }))
  }

  const handleColorChange = (rule: keyof Config['rules'], color: number) => {
    setRules((prev) => ({
      ...prev,
      [rule]: {
        ...prev[rule],
        color,
      },
    }))
  }

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
      rules,
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
    rules,
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
          max={maxRadius}
          onChange={(value) => setMinRadius(value)}
        />
      </div>
      <div className="UI__option">
        <span className="Option__title">Max Radius</span>
        <Number
          value={maxRadius}
          min={minRadius}
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

      {Object.entries(rules).map(([key, value]) => {
        return (
          <div className="ParticleLife__group" key={key}>
            <div className="UI__option">
              <span className="Option__title">{key}</span>
              <Color value={colorToRGBA(value.color)} onChange={() => {}} />
            </div>

            <Rule from={key} rules={rules} onChange={handleRuleChange} />
          </div>
        )
      })}
    </div>
  )
}

const Rule: FC<{
  from: keyof Config['rules']
  rules: Config['rules']
  onChange: (
    from: keyof Config['rules'],
    to: keyof Config['rules'],
    value: number,
  ) => void
}> = ({ from, rules, onChange }) => {
  return (
    <div className="ParticleLife__group">
      {Object.entries(rules).map(([to]) => {
        return (
          <div className="UI__option" key={`${from}-${to}`}>
            <span className="Option__title-group">
              <span
                className="ParticleLife__color"
                style={{ background: colorToRGBA(rules[from].color) }}
              />
              &nbsp;►&nbsp;
              <span
                className="ParticleLife__color"
                style={{ background: colorToRGBA(rules[to].color) }}
              />
            </span>
            <Range
              value={rules[from][to] * 100}
              min={-100}
              max={100}
              step={1}
              onChange={(value) =>
                onChange(from, to, mapRange(value, -100, 100, -1, 1))
              }
            />
          </div>
        )
      })}
    </div>
  )
}
