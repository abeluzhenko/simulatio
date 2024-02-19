import { Metric } from '../metric/Metric'
import { Render } from '../render/Render'
import { Simulation } from '../simulation/Simulation'
import { Item } from '../simulation/common'

export class AppLoop {
  private rafId: number

  constructor(
    private render: Render,
    private simulation: Simulation<Item>,
    private metric: Metric,
  ) {}

  destroy() {
    cancelAnimationFrame(this.rafId)
  }

  loop = () => {
    let ts = performance.now()

    this.render.tick()
    const renderTime = performance.now() - ts
    ts = performance.now()

    this.simulation.tick()
    const simulationTime = performance.now() - ts

    this.metric.addFrame({
      render: renderTime,
      simulation: simulationTime,
      total: renderTime + simulationTime,
    })
    this.rafId = requestAnimationFrame(this.loop)
  }
}
