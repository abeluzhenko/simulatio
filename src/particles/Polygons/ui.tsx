import React, { FC, useEffect, useState } from 'react'
import { Number } from '../../ui/components/Number/Number'
import { Config } from './config'

type Props = {
  defaultConfig: Config
  onChange: (config: Config) => void
}

export const UI: FC<Props> = ({ onChange, defaultConfig }) => {
  const [count, setCount] = useState(defaultConfig.count)

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
      </div>
    </div>
  )
}
