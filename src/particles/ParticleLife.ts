import { Random } from '../math/Random'
import { ItemId, Storage } from '../storage/Storage'
import { World, ItemFactory } from '../simulation/common'
import { Particle } from './Particle'
import { Vector2, distance } from '../math/Vector2'
import { Rect } from '../math/Rect'

const MAX_RADIUS = 6
const MIN_RADIUS = 2
const FORCE_RADIUS = 80
const DAMPING = 0.32
const GRAVITY_DAMPING = 0.5

const KINDS = ['red', 'green', 'blue']
const RULES = {
  red: {
    red: -0.1,
    green: -0.34,
    blue: 1,
  },
  green: {
    red: -0.17,
    green: -0.34,
    blue: -0.34,
  },
  blue: {
    red: 1,
    green: -0.2,
    blue: 0.15,
  },
}

export class ParticleLife implements Particle {
  private position: Vector2
  private velocity: Vector2
  private radius: number
  private gravityCenter: Vector2

  kind: (typeof KINDS)[number]

  private _rect: Rect
  private _forceRect: Rect

  get rect(): Rect {
    return this._rect
  }

  constructor(
    public id: ItemId,
    private storage: Storage<ParticleLife>,
    private world: World,
  ) {
    this.kind = KINDS[Math.floor(Random.next() * KINDS.length)]
    this.position = {
      x: Random.next() * world.width,
      y: Random.next() * world.height,
    }
    this.velocity = {
      x: 0,
      y: 0,
    }
    this.radius = Math.max(MIN_RADIUS, Random.next() * MAX_RADIUS)
    this._rect = {
      x: this.position.x - this.radius,
      y: this.position.y - this.radius,
      width: this.radius * 2,
      height: this.radius * 2,
    }
    this._forceRect = {
      x: this.position.x - FORCE_RADIUS,
      y: this.position.y - FORCE_RADIUS,
      width: FORCE_RADIUS * 2,
      height: FORCE_RADIUS * 2,
    }
    this.gravityCenter = {
      x: world.width / 2,
      y: world.height / 2,
    }
  }

  update() {
    if (this.position.x < 0) {
      this.position.x = this.world.width - 1
    }
    if (this.position.x > this.world.width) {
      this.position.x = 1
    }
    if (this.position.y < 0) {
      this.position.y = this.world.height - 1
    }
    if (this.position.y > this.world.height) {
      this.position.y = 1
    }

    const intersecting = this.storage.intersecting(this._forceRect)
    let fx = 0
    let fy = 0
    for (const other of intersecting) {
      if (other === this) {
        continue
      }

      const d = distance(this.position, other.position)
      const dx = other.position.x - this.position.x
      const dy = other.position.y - this.position.y
      const minD = this.radius + other.radius
      const g = RULES[this.kind]?.[other.kind] ?? 0

      if (g !== 0 && d <= FORCE_RADIUS && d > minD) {
        const f = (g * 1) / d

        fx += f * dx
        fy += f * dy
      }
      if (d <= minD) {
        const f = 1 / d

        fx -= f * dx
        fy -= f * dy
      }
    }

    const gd = distance(this.position, this.gravityCenter)
    fx += ((this.gravityCenter.x - this.position.x) / gd) * GRAVITY_DAMPING
    fy += ((this.gravityCenter.y - this.position.y) / gd) * GRAVITY_DAMPING

    this.velocity.x = (this.velocity.x + fx) * DAMPING
    this.velocity.y = (this.velocity.y + fy) * DAMPING
    this.position.x += this.velocity.x
    this.position.y += this.velocity.y

    this._rect.x = this.position.x - this.radius
    this._rect.y = this.position.y - this.radius
    this._forceRect.x = this.position.x - FORCE_RADIUS
    this._forceRect.y = this.position.y - FORCE_RADIUS
  }

  render(ctx: CanvasRenderingContext2D) {
    const sx = this.position.x / this.world.width
    const sy = this.position.y / this.world.height
    const r =
      this.kind === 'red' ? 100 + Math.floor(sx * 155) : Math.floor(sx * 100)
    const b =
      this.kind === 'blue' ? 100 + Math.floor(sy * 155) : Math.floor(sy * 100)
    const g = this.kind === 'green' ? 255 : 50

    ctx.fillStyle = `rgb(${r}, ${g}, ${b})`
    ctx.beginPath()
    ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2)
    ctx.closePath()
    ctx.fill()
  }

  destroy() {}

  static create: ItemFactory<ParticleLife> = ({ id, storage, world }) => {
    return new ParticleLife(id, storage, world)
  }
}
