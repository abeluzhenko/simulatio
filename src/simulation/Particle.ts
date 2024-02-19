import { Random } from '../math/Random'
import { ItemId, Storage } from '../storage/Storage'
import { World, ItemFactory } from './common'

const MAX_SPEED = 4
const MIN_SPEED = 1
const MAX_RADIUS = 3
const MIN_RADIUS = 1

export class Particle {
  private x: number
  private y: number
  private vx: number
  private vy: number
  private radius: number
  private color: string

  constructor(
    public id: ItemId,
    private storage: Storage<Particle>,
    private world: World,
  ) {
    this.x = Random.next() * world.width
    this.y = Random.next() * world.height
    this.vx = Random.next() * MAX_SPEED - MIN_SPEED
    this.vy = Random.next() * MAX_SPEED - MIN_SPEED
    this.radius = Math.max(MIN_RADIUS, Random.next() * MAX_RADIUS)
  }

  update() {
    const nextX = this.x + this.vx
    const nextY = this.y + this.vy

    if (nextX >= this.world.width || nextX <= 0) {
      this.vx = -this.vx
    }
    if (nextY >= this.world.height || nextY <= 0) {
      this.vy = -this.vy
    }

    for (const other of this.storage) {
      if (other === this) {
        continue
      }

      const dx = other.x - nextX
      const dy = other.y - nextY
      const dsq = dx * dx + dy * dy
      if (Math.sqrt(dsq) <= this.radius + other.radius) {
        const dv = (2 * (dx * this.vx + dy * this.vy)) / dsq
        this.vx -= dv * dx
        this.vy -= dv * dy
      }
    }

    this.x += this.vx
    this.y += this.vy

    const r = Math.floor((this.x / this.world.width) * 255)
    const g = Math.floor((this.y / this.world.height) * 255)
    const b = 0
    this.color = `rgb(${r}, ${g}, ${b})`
  }

  render(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = this.color
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2)
    ctx.closePath()
    ctx.fill()
  }

  destroy() {}

  static create: ItemFactory<Particle> = ({ id, storage, world }) => {
    return new Particle(id, storage, world)
  }
}
