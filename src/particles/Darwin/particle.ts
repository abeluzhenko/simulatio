import { Random } from '../../math/Random'
import { ItemId, Storage } from '../../storage/Storage'
import { World, ItemFactory } from '../../simulation/common'
import { Particle, createGraphics } from '../Particle'
import { Vector2, distance, normalize, rotate } from '../../math/Vector2'
import { Rect } from '../../math/Rect'
import { Config, defaultConfig } from './config'
import { UI } from './ui'
import { createColor } from '../../math/Color'

export class Darwin implements Particle {
  private static _config = defaultConfig

  static get config() {
    return Darwin._config
  }

  static get ui() {
    return UI
  }

  private position: Vector2
  private velocity: Vector2
  private radius: number
  private mass: number
  private maxMass: number
  private killsCount = 0
  private _rect: Rect

  get rect(): Rect {
    return this._rect
  }

  graphics = createGraphics({
    type: 'circle',
    radius: 0,
    color: 0x0,
    x: 0,
    y: 0,
    strokeWidth: 0,
    strokeColor: 0x0,
    visible: true as boolean,
  })

  constructor(
    public id: ItemId,
    private storage: Storage<Darwin>,
    private world: World,
  ) {
    this.position = {
      x: Random.next() * world.width,
      y: Random.next() * world.height,
    }
    this.velocity = {
      x: Random.next() * Darwin._config.maxSpeed - Darwin._config.minSpeed,
      y: Random.next() * Darwin._config.maxSpeed - Darwin._config.minSpeed,
    }
    this.mass = Math.max(
      Darwin._config.minRadius,
      Random.next() * Darwin._config.maxRadius,
    )
    this.maxMass = Darwin._config.massThreshold * Random.next()
    this.radius = this.mass
    this._rect = {
      x: this.position.x - this.radius,
      y: this.position.y - this.radius,
      width: this.radius * 2,
      height: this.radius * 2,
    }
  }

  update() {
    this.radius += (this.mass - this.radius) * 0.1

    if (this.mass === 0) {
      return
    }

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

    const intersecting = this.storage.intersecting({
      x: nextPos.x,
      y: nextPos.y,
      width: this._rect.width,
      height: this._rect.height,
    })
    for (const other of intersecting) {
      if (other === this || other.mass === 0) {
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

        if (other.mass > this.mass) {
          other.killsCount++
          other.mass += this.mass * Darwin._config.absorbRate
          this.die()
        } else {
          this.killsCount++
          this.mass += other.mass * Darwin._config.absorbRate
          other.die()
        }
      }
    }

    if (this.mass >= this.maxMass) {
      this.explode()
    }

    const [, nearest] = this.storage.nearest(this.position, 2)
    if (nearest && nearest.mass !== 0) {
      const dx = nearest.position.x - this.position.x
      const dy = nearest.position.y - this.position.y
      const targetVelocity = normalize({ x: dx, y: dy })

      if (nearest.mass < this.mass) {
        this.velocity.x += (targetVelocity.x - this.velocity.x) * 0.1
        this.velocity.y += (targetVelocity.y - this.velocity.y) * 0.1
      }
    }

    this.position.x += this.velocity.x
    this.position.y += this.velocity.y

    this._rect.x = this.position.x - this.radius
    this._rect.y = this.position.y - this.radius
    this._rect.width = this.radius * 2
    this._rect.height = this.radius * 2

    const r = Math.floor((this.position.y / this.world.height) * 255)
    const b = Math.floor((this.position.x / this.world.width) * 255)
    const g = 50

    this.graphics[0].visible = this.mass > 0
    this.graphics[0].color = createColor(r, g, b, 1)
    this.graphics[0].radius = this.radius
    this.graphics[0].x = this.position.x
    this.graphics[0].y = this.position.y
  }

  destroy() {}

  private explode() {
    const { x, y } = this.position
    const { radius, killsCount } = this

    this.die()

    for (let i = 0; i <= killsCount; i++) {
      const particle = Darwin.DeadPool.pop()
      if (!particle) {
        break
      }

      const angle = Random.next() * Math.PI * 2
      particle.velocity.x = Math.cos(angle) * Darwin._config.maxSpeed
      particle.velocity.y = Math.sin(angle) * Darwin._config.maxSpeed
      particle.position.x = x + Math.cos(angle) * radius * Random.next()
      particle.position.y = y + Math.sin(angle) * radius * Random.next()
      particle.mass = Math.max(
        Darwin._config.minRadius,
        Random.next() * Darwin._config.maxRadius,
      )
      particle.maxMass = Darwin._config.massThreshold * Random.next()
      particle.radius = particle.mass

      particle._rect = {
        x: particle.position.x - particle.radius,
        y: particle.position.y - particle.radius,
        width: particle.radius * 2,
        height: particle.radius * 2,
      }
    }
  }

  die() {
    this.mass = 0
    this.radius = 0
    this.killsCount = 0
    this.position.x = -100
    this.position.y = -100

    this._rect.x = -100
    this._rect.y = -100
    this._rect.width = 0
    this._rect.height = 0

    this.graphics[0].visible = this.mass > 0

    Darwin.DeadPool.push(this)
  }

  static DeadPool: Darwin[] = []

  static create: ItemFactory<Darwin> = ({ id, storage, world }) => {
    return new Darwin(id, storage, world)
  }

  static updateConfig(value: Config) {
    Darwin._config = value
  }
}
