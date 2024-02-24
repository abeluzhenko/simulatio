import { Rect } from '../math/Rect'
import { Storage } from '../storage/Storage'

type RenderItem = {
  render(ctx: CanvasRenderingContext2D): void
  bbox: Rect
}

type RenderConfig = {
  vpHeight: number
  vpWidth: number
  bgColor?: string
}

export class Render {
  private ctx: CanvasRenderingContext2D
  private viewport: Rect

  constructor(
    canvas: HTMLCanvasElement,
    private storage: Storage<RenderItem>,
    private config: RenderConfig,
  ) {
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      throw new Error('Canvas 2D context is not supported')
    }
    this.ctx = ctx
    this.viewport = {
      x: 0,
      y: 0,
      width: config.vpWidth,
      height: config.vpHeight,
    }
  }

  updateConfig(config: Partial<RenderConfig>) {
    Object.assign(this.config, config)

    this.viewport.width = this.config.vpWidth
    this.viewport.height = this.config.vpHeight
  }

  tick() {
    if (this.config.bgColor) {
      this.ctx.fillStyle = this.config.bgColor
      this.ctx.fillRect(
        this.viewport.x,
        this.viewport.y,
        this.viewport.width,
        this.viewport.height,
      )
    }

    for (const particle of this.storage) {
      particle.render(this.ctx)
    }
  }
}
