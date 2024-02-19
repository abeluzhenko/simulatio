import { AppLoop } from './app/AppLoop'
import { Storage } from './storage/Storage'
import { Metric } from './metric/Metric'
import { Render } from './render/Render'
import { Simulation } from './simulation/Simulation'
import { Particle } from './simulation/Particle'
import { Random } from './math/Random'

document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('canvas') as HTMLCanvasElement
  if (!canvas) {
    throw new Error('Canvas element not found')
  }

  const { innerWidth, innerHeight } = window
  canvas.width = innerWidth
  canvas.height = innerHeight

  Random.seed(0)

  const storage = new Storage<Particle>()
  const render = new Render(canvas, storage, {
    vpWidth: canvas.width,
    vpHeight: canvas.height,
    bgColor: '#000000',
  })
  const simulation = new Simulation(storage, {
    width: canvas.width,
    height: canvas.height,
  })
  const metric = new Metric()
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

  appLoop.loop()

  simulation.start(1000, Particle.create)

  document.addEventListener('onBeforeUnload', () => {
    resizeObserver.disconnect()
    simulation.stop()
    appLoop.destroy()
  })
})
