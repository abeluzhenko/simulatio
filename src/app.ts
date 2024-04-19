import { AppLoop } from './app/AppLoop'
import { SimpleQTStorage } from './storage/SimpleQTStorage'
import { Metric, PERFORMANCE_FRAME, PERFORMANCE_START } from './metric/Metric'
import { Render } from './render/Render'
import { Simulation } from './simulation/Simulation'
import { SimpleCollision } from './particles/SimpleCollision'
import { Random } from './math/Random'
import { Particle } from './particles/Particle'
import { Polygons } from './particles/Polygons'
import { ConveyLife } from './particles/ConveyLife'

declare global {
  interface Window {
    saveMetric: () => void
  }
}

const presets = {
  simpleCollision: {
    factory: SimpleCollision.create,
    count: 5_000,
    bgColor: 'rgba(0, 0, 0, 0.1)',
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
}
const PRESET = presets.simpleCollision

document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('canvas') as HTMLCanvasElement
  if (!canvas) {
    throw new Error('Canvas element not found')
  }

  const { innerWidth, innerHeight } = window
  canvas.width = innerWidth
  canvas.height = innerHeight

  Random.seed(0)

  const urlQuery = new URLSearchParams(document.location.search)
  const storage = new SimpleQTStorage<Particle>({
    x: 0,
    y: 0,
    width: canvas.width,
    height: canvas.height,
  })
  const render = new Render(canvas, storage, {
    vpWidth: canvas.width,
    vpHeight: canvas.height,
    bgColor: PRESET.bgColor ?? '#000000',
    debug: urlQuery.get('debug') ?? undefined,
  })
  const simulation = new Simulation(storage, {
    width: canvas.width,
    height: canvas.height,
    particleCount: PRESET.count,
  })
  const metric = new Metric({ framesInBuffer: 60, bufferSize: 100 })
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

  appLoop.loop(0)

  simulation.start(PRESET.count, PRESET.factory)

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

  document.addEventListener('onBeforeUnload', () => {
    resizeObserver.disconnect()
    simulation.stop()
    appLoop.destroy()
  })

  if (urlQuery.get('stats')) {
    const statsCanvas = document.createElement('canvas')
    statsCanvas.width = 200
    statsCanvas.height = 100
    statsCanvas.style.position = 'absolute'
    statsCanvas.style.top = '0'
    statsCanvas.style.left = '0'
    statsCanvas.style.backgroundColor = 'rgba(0, 0, 0, 1)'
    document.body.appendChild(statsCanvas)

    const offscreenCanvas = statsCanvas.transferControlToOffscreen()
    const statsWorker = new Worker(
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
      statsWorker.postMessage({
        type: PERFORMANCE_FRAME,
        data: frame,
      })
    }
  }
})
