import { Random } from '../math/Random'
import { ItemId, Storage } from '../storage/Storage'
import { World, ItemFactory } from '../simulation/common'
import { Particle } from './Particle'
import { Vector2, distance, rotate } from '../math/Vector2'
import { Rect } from '../math/Rect'

const MAX_SPEED = 3
const MIN_SPEED = 1
const MAX_RADIUS = 3
const MIN_RADIUS = 1
const DENSITY = 1

export class SimpleCollision implements Particle {
  private position: Vector2
  private velocity: Vector2
  private radius: number
  private mass: number
  private color: string
  private skipCollision = false

  private _bbox: Rect

  get bbox(): Rect {
    return this._bbox
  }

  constructor(
    public id: ItemId,
    private storage: Storage<SimpleCollision>,
    private world: World,
  ) {
    this.position = {
      x: Random.next() * world.width,
      y: Random.next() * world.height,
    }
    this.velocity = {
      x: Random.next() * MAX_SPEED - MIN_SPEED,
      y: Random.next() * MAX_SPEED - MIN_SPEED,
    }
    this.radius = Math.max(MIN_RADIUS, Random.next() * MAX_RADIUS)
    this.mass = DENSITY * Math.PI * this.radius * this.radius
    this._bbox = {
      x: this.position.x - this.radius,
      y: this.position.y - this.radius,
      width: this.radius * 2,
      height: this.radius * 2,
    }
  }

  update() {
    const nextPos = {
      x: this.position.x + this.velocity.x,
      y: this.position.y + this.velocity.y,
    }

    if (nextPos.x >= this.world.width || nextPos.x <= 0) {
      this.velocity.x = -this.velocity.x
    }
    if (nextPos.y >= this.world.height || nextPos.y <= 0) {
      this.velocity.y = -this.velocity.y
    }

    if (!this.skipCollision) {
      const intersecting = this.storage.intersecting({
        x: nextPos.x,
        y: nextPos.y,
        width: this._bbox.width,
        height: this._bbox.height,
      })
      for (const other of intersecting) {
        if (other === this) {
          continue
        }

        if (distance(nextPos, other.position) <= this.radius + other.radius) {
          const m1 = this.mass
          const m2 = other.mass
          const mm = m1 + m2
          const theta = -Math.atan2(
            other.position.y - this.position.y,
            other.position.x - this.position.x,
          )
          const v1 = rotate(this.velocity, theta)
          const v2 = rotate(other.velocity, theta)
          const v1f = {
            x: (v1.x * (m1 - m2)) / mm + (v2.x * 2 * m2) / mm,
            y: v1.y,
          }
          const u1 = rotate(v1f, -theta)
          const v2f = {
            x: (v2.x * (m2 - m1)) / mm + (v1.x * 2 * m1) / mm,
            y: v2.y,
          }
          const u2 = rotate(v2f, -theta)

          this.velocity = u1
          other.velocity = u2

          other.skipCollision = true
        }
      }
    }
    this.skipCollision = false

    this.position.x += this.velocity.x
    this.position.y += this.velocity.y

    this._bbox.x = this.position.x - this.radius
    this._bbox.y = this.position.y - this.radius

    const r = Math.floor((this.position.y / this.world.height) * 255)
    const b = Math.floor((this.position.x / this.world.width) * 255)
    const g = 50

    this.color = `rgb(${r}, ${g}, ${b})`
  }

  render(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = this.color
    ctx.beginPath()
    ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2)
    ctx.closePath()
    ctx.fill()
  }

  destroy() {}

  static create: ItemFactory<SimpleCollision> = ({ id, storage, world }) => {
    return new SimpleCollision(id, storage, world)
  }
}
