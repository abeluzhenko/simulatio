import React from 'react'
import { createRoot } from 'react-dom/client'
import { ItemFactory } from './simulation/common'
import { GeneralConfig, SimulationFC, UI } from './ui/UI'
import { AppLoop } from './app/AppLoop'
import { Storage } from './storage/Storage'
import { SimpleStorage } from './storage/SimpleStorage'
import { MyQTStorage } from './storage/MyQTStorage'
import { RBushStorage } from './storage/RBushStorage'
import { SimpleQTStorage } from './storage/SimpleQTStorage'
import {
  Metric,
  PERFORMANCE_FRAME,
  PERFORMANCE_RESET,
  PERFORMANCE_START,
} from './metric/Metric'
import { Canvas2DRender } from './render/Canvas2DRender'
import { Simulation } from './simulation/Simulation'
import { Random } from './math/Random'
import { Particle } from './particles/Particle'
import { SimpleCollision } from './particles/SimpleCollision/particle'
import { Polygons } from './particles/Polygons/particle'
import { ConveyLife } from './particles/ConveyLife/particle'
import { Darwin } from './particles/Darwin/particle'
import { ParticleLife } from './particles/ParticleLife/particle'
import { Render } from './render/Render'
import { WebGLRender } from './render/WebGLRender'
import { debounce } from './common/Debounce'

declare global {
  interface Window {
    saveMetric: () => void
  }
}

type CommonConfig = {
  count: number
  bgColor: number
}

const PRESETS = [
  { id: 'simpleCollision', value: 'Simple Collision' },
  { id: 'darwin', value: 'Darwin' },
  { id: 'polygons', value: 'Polygons' },
  { id: 'conveyLife', value: 'Convey Life' },
  { id: 'particleLife', value: 'Particle Life' },
] as const

const STORAGES = [
  { id: 'simple', value: 'Simple' },
  { id: 'simpleQT', value: 'Simple QuadTree' },
  { id: 'myQT', value: 'My QuadTree' },
  { id: 'rbush', value: 'RBush' },
] as const

const RENDERS = [
  { id: 'canvas', value: 'Canvas' },
  { id: 'webgl', value: 'WebGL' },
] as const

const DEBUG = [
  { id: 'none', value: 'None' },
  { id: 'storage', value: 'Storage' },
] as const

let cleanup: () => void | undefined

const presets: {
  [Key in (typeof PRESETS)[number]['id']]: {
    create: ItemFactory<any>
    config: CommonConfig
    updateConfig: (config: CommonConfig & any) => void
    ui: SimulationFC<any>
  }
} = {
  simpleCollision: SimpleCollision,
  darwin: Darwin,
  polygons: Polygons,
  conveyLife: ConveyLife,
  particleLife: ParticleLife,
}
Object.entries(presets).forEach(([key, value]) => {
  value.updateConfig(loadConfig(key, value.config))
})

let statsWorker: Worker | undefined
let simulation: Simulation<Particle>
let render: Render
const metric = new Metric({ framesInBuffer: 20, bufferSize: 100 })

const SIMULATION_FPS = 120

const SIMULATIONS_UI = Object.entries(presets).reduce((acc, [key, value]) => {
  acc[key] = {
    Simulation: value.ui,
    onChange: (config: { count: number; bgColor: number }) => {
      if (value.config.count !== config.count) {
        simulation.setPopulation(config.count)
      }

      if (value.config.bgColor !== config.bgColor) {
        render.updateConfig({ bgColor: config.bgColor })
      }

      saveConfig(key, config)
      value.updateConfig(config)
    },
    defaultConfig: loadConfig(key, value.config),
  }
  return acc
}, {})

const currentConfig = loadConfig<GeneralConfig>('general', {
  preset: 'simpleCollision',
  storage: 'simple',
  render: 'canvas',
  debug: 'none',
  speed: 1,
  showStats: true,
  showConfig: true,
})

const saveConfig = debounce(function saveConfig<T>(key: string, config: T) {
  localStorage.setItem(key, JSON.stringify(config))
}, 200)

function loadConfig<T>(key: string, defaultValue: T): T {
  const storageConfig = localStorage.getItem(key)
  if (!storageConfig) {
    return defaultValue
  }

  return Object.assign({}, defaultValue, JSON.parse(storageConfig))
}

document.addEventListener('DOMContentLoaded', () => {
  setup(currentConfig)

  statsWorker = togglePerfStats(currentConfig.showStats, metric)
})

function setup(config: {
  preset: string
  storage: string
  render: string
  debug: string
  showStats: boolean
}) {
  metric.reset()

  const canvas = document.getElementById('canvas') as HTMLCanvasElement
  if (!canvas) {
    throw new Error('Canvas element not found')
  }

  const { innerWidth, innerHeight } = window
  canvas.width = innerWidth
  canvas.height = innerHeight

  Random.seed(0)

  const preset = presets[config?.preset ?? currentConfig.preset]

  const paramToStorage: Record<
    (typeof STORAGES)[number]['id'],
    () => Storage<Particle>
  > = {
    myQT: () =>
      new MyQTStorage({
        x: 0,
        y: 0,
        width: canvas.width,
        height: canvas.height,
      }),
    simpleQT: () =>
      new SimpleQTStorage({
        x: 0,
        y: 0,
        width: canvas.width,
        height: canvas.height,
      }),
    rbush: () => new RBushStorage({ maxItemsPerNode: 9 }),
    simple: () => new SimpleStorage(),
  }
  const storage = paramToStorage[config?.storage ?? currentConfig.storage]()

  const paramsToRender: Record<(typeof RENDERS)[number]['id'], () => Render> = {
    canvas: () =>
      new Canvas2DRender(canvas, storage, {
        vpWidth: canvas.width,
        vpHeight: canvas.height,
        bgColor: preset.config.bgColor ?? 0x000000ff,
        debug: config?.debug ?? undefined,
      }),
    webgl: () =>
      new WebGLRender(canvas, storage, {
        vpWidth: canvas.width,
        vpHeight: canvas.height,
        bgColor: preset.config.bgColor ?? 0x000000ff,
        debug: config?.debug ?? undefined,
      }),
  }
  render = paramsToRender[config?.render ?? currentConfig.render]()

  simulation = new Simulation(
    storage,
    {
      width: canvas.width,
      height: canvas.height,
      particleCount: preset.config.count,
    },
    {
      maxFPS: SIMULATION_FPS,
      speed: currentConfig.speed,
      factory: preset.create,
    },
  )
  const appLoop = new AppLoop(render, simulation, metric)

  const resizeObserver = new ResizeObserver(() => {
    const { innerWidth: width, innerHeight: height } = window

    canvas.width = width
    canvas.height = height

    render.updateConfig({
      vpWidth: width,
      vpHeight: height,
    })
  })
  resizeObserver.observe(canvas)

  simulation.start(preset.config.count)

  appLoop.loop(0)

  window.saveMetric = () => {
    const blob = new Blob([metric.toCSV()], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'metric.csv'
    a.click()
  }

  metric.onBufferFull = () => {
    console.info('Metric buffer is full')
  }

  window.addEventListener('beforeunload', cleanup)

  cleanup = () => {
    window.removeEventListener('beforeunload', cleanup)

    resizeObserver.disconnect()
    simulation.stop()
    appLoop.destroy()

    canvas.replaceWith(canvas.cloneNode(false))
    saveConfig.cancel()
  }
}

function togglePerfStats(
  showStats: boolean,
  metric: Metric,
  statsWorker?: Worker,
): Worker | undefined {
  if (!showStats && statsWorker) {
    metric.onFrame = undefined
    statsWorker.terminate()
    document.getElementById('stats')?.remove()
    return
  }

  if (!showStats) {
    return
  }

  if (showStats && statsWorker) {
    statsWorker.postMessage({ type: PERFORMANCE_RESET })
    return
  }

  const statsCanvas = document.createElement('canvas')
  statsCanvas.id = 'stats'
  statsCanvas.width = 200
  statsCanvas.height = 100
  statsCanvas.style.position = 'absolute'
  statsCanvas.style.bottom = '0'
  statsCanvas.style.left = '0'
  statsCanvas.style.backgroundColor = 'rgba(0, 0, 0, 1)'
  document.body.appendChild(statsCanvas)

  const offscreenCanvas = statsCanvas.transferControlToOffscreen()
  statsWorker = new Worker(
    new URL('./app/workers/PerfStats.ts', import.meta.url),
    {
      type: 'module',
    },
  )

  statsWorker.postMessage(
    {
      type: PERFORMANCE_START,
      data: {
        canvas: offscreenCanvas,
        width: statsCanvas.width,
        height: statsCanvas.height,
      },
    },
    [offscreenCanvas],
  )

  metric.onFrame = (frame) => {
    statsWorker?.postMessage({
      type: PERFORMANCE_FRAME,
      data: frame,
    })
  }
  return statsWorker
}

function handleOptionsChange(config: GeneralConfig) {
  let shouldSave = false
  if (
    config.preset !== currentConfig.preset ||
    config.storage !== currentConfig.storage ||
    config.render !== currentConfig.render ||
    config.debug !== currentConfig.debug
  ) {
    cleanup?.()
    setup(config)

    currentConfig.preset = config.preset
    currentConfig.storage = config.storage
    currentConfig.render = config.render
    currentConfig.debug = config.debug
    shouldSave = true
  }

  if (config.speed !== currentConfig.speed) {
    simulation.setSpeed(config.speed, SIMULATION_FPS)
    currentConfig.speed = config.speed
    shouldSave = true
  }

  if (config.showStats !== currentConfig.showStats) {
    statsWorker = togglePerfStats(config.showStats, metric, statsWorker)
    currentConfig.showStats = config.showStats
    shouldSave = true
  }

  if (config.showConfig !== currentConfig.showConfig) {
    currentConfig.showConfig = config.showConfig
    shouldSave = true
  }

  if (shouldSave) {
    saveConfig('general', currentConfig)
  }
}

const ui = document.getElementById('ui')!
const root = createRoot(ui)
root.render(
  <UI
    general={{
      onChange: handleOptionsChange,
      presets: PRESETS,
      storages: STORAGES,
      renders: RENDERS,
      debug: DEBUG,
      default: currentConfig,
    }}
    simulation={SIMULATIONS_UI}
  />,
)
