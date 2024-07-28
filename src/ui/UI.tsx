import React, { FC, useCallback, useEffect, useState } from 'react'
import './UI.css'
import { Select } from './components/Select/Select'
import { Switch } from './components/Switch/Switch'
import { Range } from './components/Range/Range'
import { mapRange } from '../math/common'
import cx from 'classnames'

type Item = {
  readonly id: string
  readonly value: string
}

export type GeneralConfig = {
  preset: string
  storage: string
  render: string
  debug: string
  speed: number
  showStats: boolean
  showConfig: boolean
}

export type SimulationFC<T = unknown> = FC<{
  defaultConfig: T
  onChange: (value: T) => void
}>

type Props = {
  general: {
    presets: Readonly<[Item, ...Item[]]>
    storages: Readonly<[Item, ...Item[]]>
    renders: Readonly<[Item, ...Item[]]>
    debug: Readonly<[Item, ...Item[]]>
    default: GeneralConfig
    onChange: (general: GeneralConfig) => void
  }
  simulation: Record<
    string,
    {
      Simulation: SimulationFC
      defaultConfig: unknown
      onChange: (value: unknown) => void
    }
  >
}

export const UI: FC<Props> = ({ general, simulation }) => {
  const [opened, setOpened] = useState(general.default.showConfig)
  const [speed, setSpeed] = useState(general.default.speed)
  // @todo: this is just awful, refactor this
  const [preset, setPreset] = useState(
    general.presets.find((p) => p.id === general.default.preset)!,
  )
  const [storage, setStorage] = useState(
    general.storages.find((s) => s.id === general.default.storage)!,
  )
  const [render, setRender] = useState(
    general.renders.find((r) => r.id === general.default.render)!,
  )
  const [debug, setDebug] = useState(
    general.debug.find((d) => d.id === general.default.debug)!,
  )
  const [showStats, setShowStats] = useState(general.default.showStats)

  const handleRenderChange = useCallback(
    (value: Item) => {
      setRender(value)
    },
    [setRender],
  )

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

  const {
    Simulation,
    defaultConfig: simulationDefaultConfig,
    onChange: onSimulationConfigChange,
  } = simulation[preset.id]

  useEffect(() => {
    general.onChange({
      preset: preset.id,
      storage: storage.id,
      render: render.id,
      debug: debug.id,
      speed,
      showStats,
      showConfig: opened,
    })
  }, [speed, preset, storage, render, debug, showStats, opened])

  return (
    <div className={cx('UI__sidebar', { 'UI__sidebar--opened': opened })}>
      <button
        className={cx('UI__toggle', { 'UI__toggle--opened': opened })}
        onClick={() => setOpened(!opened)}
        value={opened ? 'Close' : 'Open'}
      />
      <div className="UI__content">
        <div className="UI__group">
          <div className="UI__option">
            <span className="Option__title">Speed</span>
            <Range
              min={0}
              max={100}
              step={1}
              value={speed * 100}
              onChange={(value) => setSpeed(mapRange(value, 0, 100, 0, 1))}
            />
          </div>
          <div className="UI__option">
            <span className="Option__title">Render</span>
            <Select
              value={render}
              options={general.renders}
              onChange={handleRenderChange}
            />
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
        <Simulation
          defaultConfig={simulationDefaultConfig}
          onChange={onSimulationConfigChange}
        />
      </div>
    </div>
  )
}
