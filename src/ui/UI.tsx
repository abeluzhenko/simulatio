import React, { FC, useCallback, useEffect, useState } from 'react'
import './UI.css'
import { Select } from './components/Select/Select'
import { Switch } from './components/Switch/Switch'
import { Range } from './components/Range/Range'
import cx from 'classnames'

type Item = {
  readonly id: string
  readonly value: string
}

export type GeneralConfig = {
  preset: string
  storage: string
  debug: string
  speed: number
  showStats: boolean
}

type Props = {
  general: {
    presets: Readonly<[Item, ...Item[]]>
    storages: Readonly<[Item, ...Item[]]>
    debug: Readonly<[Item, ...Item[]]>
    onChange: (general: GeneralConfig) => void
    default: GeneralConfig
  }
}

export const UI: FC<Props> = ({ general }) => {
  const [opened, setOpened] = useState(true)
  const [speed, setSpeed] = useState(100)
  // @todo: this is just awful, refactor this
  const [preset, setPreset] = useState(
    general.presets.find((p) => p.id === general.default.preset)!,
  )
  const [storage, setStorage] = useState(
    general.storages.find((s) => s.id === general.default.storage)!,
  )
  const [debug, setDebug] = useState(
    general.debug.find((d) => d.id === general.default.debug)!,
  )
  const [showStats, setShowStats] = useState(general.default.showStats)

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

  useEffect(() => {
    general.onChange({
      preset: preset.id,
      storage: storage.id,
      debug: debug.id,
      speed,
      showStats,
    })
  }, [speed, preset, storage, debug, showStats])

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
          <span className="Option__title">Preset</span>
          <Select
            value={preset}
            options={general.presets}
            onChange={handlePresetChange}
          />
        </div>
        <div className="UI__option">
          <span className="Option__title">Storage</span>
          <Select
            value={storage}
            options={general.storages}
            onChange={handleStorageChange}
          />
        </div>
        <div className="UI__option">
          <span className="Option__title">Debug</span>
          <Select value={debug} options={general.debug} onChange={setDebug} />
        </div>
        <div className="UI__option">
          <span className="Option__title">Show stats</span>
          <Switch value={showStats} onChange={setShowStats} />
        </div>
      </div>
    </div>
  )
}
