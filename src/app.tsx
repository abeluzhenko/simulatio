import React from 'react'
import { createRoot } from 'react-dom/client'
import { GeneralConfig, UI } from './ui/UI'
import { AppLoop } from './app/AppLoop'
import { Storage } from './storage/Storage'
import { MyQTStorage } from './storage/MyQTStorage'
import { RBushStorage } from './storage/RBushStorage'
import {
  Metric,
  PERFORMANCE_FRAME,
  PERFORMANCE_RESET,
  PERFORMANCE_START,
} from './metric/Metric'
import { Render } from './render/Render'
import { Simulation } from './simulation/Simulation'
import { SimpleCollision } from './particles/SimpleCollision'
import { Random } from './math/Random'
import { Particle } from './particles/Particle'
import { Polygons } from './particles/Polygons'
import { ConveyLife } from './particles/ConveyLife'
import { SimpleStorage } from './storage/SimpleStorage'
import { Lines } from './particles/Lines'
import { Darwin } from './particles/Darwin'
import { ParticleLife } from './particles/ParticleLife'
import { SimpleQTStorage } from './storage/SimpleQTStorage'
import { ItemFactory } from './simulation/common'

declare global {
  interface Window {
    saveMetric: () => void
  }
}

const PRESETS = [
  { id: 'simpleCollision', value: 'Simple Collision' },
  { id: 'darwin', value: 'Darwin' },
  { id: 'polygons', value: 'Polygons' },
  { id: 'conveyLife', value: 'Convey Life' },
  { id: 'particleLife', value: 'Particle Life' },
  { id: 'lines', value: 'Lines' },
] as const

const STORAGES = [
  { id: 'simple', value: 'Simple' },
  { id: 'simpleQT', value: 'Simple QuadTree' },
  { id: 'myQT', value: 'My QuadTree' },
  { id: 'rbush', value: 'RBush' },
] as const

const DEBUG = [
  { id: 'none', value: 'None' },
  { id: 'storage', value: 'Storage' },
] as const

const presets: {
  [Key in (typeof PRESETS)[number]['id']]: {
    factory: ItemFactory<any>
    count: number
    bgColor: string
  }
} = {
  simpleCollision: {
    factory: SimpleCollision.create,
    count: 400,
    bgColor: 'rgba(0, 0, 0, 0.05)',
  },
  darwin: {
    factory: Darwin.create,
    count: 10_000,
    bgColor: 'rgba(0, 0, 0, 0.05)',
  },
  polygons: {
    factory: Polygons.create,
    count: 1000,
    bgColor: 'rgba(0, 0, 0, 0.1)',
  },
  conveyLife: {
    factory: ConveyLife.create,
    count: 10_000,
    bgColor: 'rgba(0, 0, 0, 0.1)',
  },
  particleLife: {
    factory: ParticleLife.create,
    count: 2000,
    bgColor: 'rgba(0, 0, 0, 0.03)',
  },
  lines: {
    factory: Lines.create,
    count: 1000,
    bgColor: 'rgba(0, 0, 0, 1)',
  },
}

const currentConfig = loadConfig({
  preset: 'simpleCollision',
  storage: 'simple',
  debug: 'none',
  speed: 100,
  showStats: true,
})

let cleanup: () => void | undefined
let statsWorker: Worker | undefined
const metric = new Metric({ framesInBuffer: 20, bufferSize: 100 })

document.addEventListener('DOMContentLoaded', () => {
  setup()

  statsWorker = togglePerfStats(currentConfig.showStats, metric)
})

function setup(config?: {
  preset: string
  storage: string
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
  const render = new Render(canvas, storage, {
    vpWidth: canvas.width,
    vpHeight: canvas.height,
    bgColor: preset.bgColor ?? '#000000',
    debug: config?.debug ?? undefined,
  })

  const simulation = new Simulation(storage, {
    width: canvas.width,
    height: canvas.height,
    particleCount: preset.count,
  })
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

  simulation.start(preset.count, preset.factory)

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

  document.addEventListener('onBeforeUnload', cleanup)

  cleanup = () => {
    document.removeEventListener('onBeforeUnload', cleanup)

    resizeObserver.disconnect()
    simulation.stop()
    appLoop.destroy()
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
  statsCanvas.style.top = '0'
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
    config.debug !== currentConfig.debug ||
    config.speed !== currentConfig.speed
  ) {
    cleanup?.()
    setup(config)

    currentConfig.preset = config.preset
    currentConfig.storage = config.storage
    currentConfig.debug = config.debug
    currentConfig.speed = config.speed
    shouldSave = true
  }

  if (config.showStats !== currentConfig.showStats) {
    statsWorker = togglePerfStats(config.showStats, metric, statsWorker)
    currentConfig.showStats = config.showStats
    shouldSave = true
  }

  if (shouldSave) {
    saveConfig(currentConfig)
  }
}

function saveConfig(config: GeneralConfig) {
  console.log(config)
  localStorage.setItem('config', JSON.stringify(config))
}

function loadConfig(defaultValue: GeneralConfig): GeneralConfig {
  const storageConfig = localStorage.getItem('config')
  if (!storageConfig) {
    return defaultValue
  }

  return Object.assign({}, defaultValue, JSON.parse(storageConfig))
}

const ui = document.getElementById('ui')!
const root = createRoot(ui)
root.render(
  <UI
    general={{
      onChange: handleOptionsChange,
      presets: PRESETS,
      storages: STORAGES,
      debug: DEBUG,
      default: currentConfig,
    }}
  />,
)
