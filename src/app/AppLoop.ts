import { Metric } from '../metric/Metric'
import { Particle } from '../particles/Particle'
import { Render } from '../render/Render'
import { Simulation } from '../simulation/Simulation'

export class AppLoop {
  private rafId: number
  private lastTimestamp = performance.now()

  constructor(
    private render: Render,
    private simulation: Simulation<Particle>,
    private metric: Metric,
  ) {}

  destroy() {
    cancelAnimationFrame(this.rafId)
  }

  loop = (timestamp: number) => {
    const dt = timestamp - this.lastTimestamp
    let ts = performance.now()

    this.render.tick()
    const renderTime = performance.now() - ts
    ts = performance.now()

    this.simulation.tick(dt)
    const simulationTime = performance.now() - ts

    this.metric.addFrame({
      render: renderTime,
      simulation: simulationTime,
      total: renderTime + simulationTime,
    })

    this.lastTimestamp = timestamp
    this.rafId = requestAnimationFrame(this.loop)
  }
}
