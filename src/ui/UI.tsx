import React, { FC, useCallback, useState } from 'react'
import './UI.css'
import { Select } from './components/Select/Select'
import { Switch } from './components/Switch/Switch'
import { Range } from './components/Range/Range'
import { Number } from './components/Number/Number'
import cx from 'classnames'

type Item = {
  id: string
  value: string
}

const PRESETS: Item[] = [
  { id: 'simpleCollision', value: 'Simple Collision' },
  { id: 'darwin', value: 'Darwin' },
  { id: 'polygons', value: 'Polygons' },
  { id: 'conveyLife', value: 'Convey Life' },
  { id: 'particleLife', value: 'Particle Life' },
  { id: 'lines', value: 'Lines' },
]

const STORAGES: Item[] = [
  { id: 'simple', value: 'Simple' },
  { id: 'simpleQT', value: 'QuadTree' },
  { id: 'rbush', value: 'RBush' },
]

const DEBUG: Item[] = [
  { id: 'none', value: 'None' },
  { id: 'storage', value: 'Storage' },
]

export const UI: FC = () => {
  const [opened, setOpened] = useState(true)
  const [speed, setSpeed] = useState(100)
  const [preset, setPreset] = useState(PRESETS[0])
  const [count, setCount] = useState(1000)
  const [storage, setStorage] = useState(STORAGES[0])
  const [debug, setDebug] = useState(DEBUG[0])
  const [showStats, setShowStats] = useState(true)

  const handlePresetChange = useCallback(
    (value: Item) => {
      setPreset(value)
    },
    [setPreset],
  )

  const handleStorageChange = useCallback(
    (value: Item) => {
      setStorage(value)
    },
    [setStorage],
  )

  return (
    <div className={cx('UI__sidebar', { 'UI__sidebar--opened': opened })}>
      <button
        className={cx('UI__toggle', { 'UI__toggle--opened': opened })}
        onClick={() => setOpened(!opened)}
        value={opened ? 'Close' : 'Open'}
      />
      <div className="UI__group">
        <div className="UI__option">
          <span className="Option__title">Speed</span>
          <Range min={0} max={100} value={speed} onChange={setSpeed} />
        </div>
        <div className="UI__option">
          <span className="Option__title">Count</span>
          <Number min={0} max={10000} value={count} onChange={setCount} />
        </div>
        <div className="UI__option">
          <span className="Option__title">Preset</span>
          <Select
            value={preset}
            options={PRESETS}
            onChange={handlePresetChange}
          />
        </div>
        <div className="UI__option">
          <span className="Option__title">Storage</span>
          <Select
            value={storage}
            options={STORAGES}
            onChange={handleStorageChange}
          />
        </div>
        <div className="UI__option">
          <span className="Option__title">Debug</span>
          <Select value={debug} options={DEBUG} onChange={setDebug} />
        </div>
        <div className="UI__option">
          <span className="Option__title">Show stats</span>
          <Switch value={showStats} onChange={setShowStats} />
        </div>
      </div>
    </div>
  )
}
