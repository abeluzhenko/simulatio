import { colorToRGBA } from '../math/Color'
import { Rect } from '../math/Rect'
import { Storage } from '../storage/Storage'
import { Graphics } from './Graphics'
import { Render, RenderConfig, RenderItem } from './Render'

export class Canvas2DRender implements Render {
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
      this.ctx.fillStyle = colorToRGBA(this.config.bgColor)
      this.ctx.fillRect(
        this.viewport.x,
        this.viewport.y,
        this.viewport.width,
        this.viewport.height,
      )
    }

    for (const particle of this.storage) {
      this.render(particle.graphics)
    }
  }

  destroy() {}

  private render(graphics: Graphics[]) {
    for (const shape of graphics) {
      if (!shape.visible) {
        continue
      }

      this.ctx.fillStyle = colorToRGBA(shape.color)
      if (shape.strokeWidth > 0) {
        this.ctx.strokeStyle = colorToRGBA(shape.strokeColor)
        this.ctx.lineWidth = shape.strokeWidth
      }
      switch (shape.type) {
        case 'rectangle': {
          this.ctx.fillRect(shape.x, shape.y, shape.width, shape.height)
          if (shape.strokeWidth > 0) {
            this.ctx.strokeRect(shape.x, shape.y, shape.width, shape.height)
          }
          break
        }
        case 'circle': {
          this.ctx.beginPath()
          this.ctx.arc(shape.x, shape.y, shape.radius, 0, Math.PI * 2)
          this.ctx.fill()
          if (shape.strokeWidth > 0) {
            this.ctx.stroke()
          }
          break
        }
        case 'line': {
          this.ctx.beginPath()
          this.ctx.moveTo(shape.x1, shape.y1)
          this.ctx.lineTo(shape.x2, shape.y2)
          this.ctx.closePath()
          this.ctx.stroke()
          break
        }
      }
    }
  }
}
