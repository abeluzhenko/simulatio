import { Random } from '../../math/Random'
import { ItemId, Storage } from '../../storage/Storage'
import { World, ItemFactory } from '../../simulation/common'
import { Particle } from '../Particle'
import { Vector2, distance } from '../../math/Vector2'
import { Rect } from '../../math/Rect'
import { Config, defaultConfig } from './config'

export class ParticleLife implements Particle {
  private static config = defaultConfig

  private position: Vector2
  private velocity: Vector2
  private radius: number
  private gravityCenter: Vector2

  kind: Config['kinds'][number]

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
    this.kind =
      ParticleLife.config.kinds[
        Math.floor(Random.next() * ParticleLife.config.kinds.length)
      ]
    this.position = {
      x: Random.next() * world.width,
      y: Random.next() * world.height,
    }
    this.velocity = {
      x: 0,
      y: 0,
    }
    this.radius = Math.max(
      ParticleLife.config.minRadius,
      Random.next() * ParticleLife.config.maxRadius,
    )
    this._rect = {
      x: this.position.x - this.radius,
      y: this.position.y - this.radius,
      width: this.radius * 2,
      height: this.radius * 2,
    }
    this._forceRect = {
      x: this.position.x - ParticleLife.config.forceRadius,
      y: this.position.y - ParticleLife.config.forceRadius,
      width: ParticleLife.config.forceRadius * 2,
      height: ParticleLife.config.forceRadius * 2,
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
      const g = ParticleLife.config.rules[this.kind]?.[other.kind] ?? 0

      if (g !== 0 && d <= ParticleLife.config.forceRadius && d > minD) {
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
    fx +=
      ((this.gravityCenter.x - this.position.x) / gd) *
      ParticleLife.config.gravityDamping
    fy +=
      ((this.gravityCenter.y - this.position.y) / gd) *
      ParticleLife.config.gravityDamping

    this.velocity.x = (this.velocity.x + fx) * ParticleLife.config.damping
    this.velocity.y = (this.velocity.y + fy) * ParticleLife.config.damping
    this.position.x += this.velocity.x
    this.position.y += this.velocity.y

    this._rect.x = this.position.x - this.radius
    this._rect.y = this.position.y - this.radius
    this._forceRect.x = this.position.x - ParticleLife.config.forceRadius
    this._forceRect.y = this.position.y - ParticleLife.config.forceRadius
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

  static updateConfig(value: Config) {
    ParticleLife.config = value
  }
}
