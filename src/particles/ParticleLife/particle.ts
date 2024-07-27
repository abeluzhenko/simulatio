import { Random } from '../../math/Random'
import { ItemId, Storage } from '../../storage/Storage'
import { World, ItemFactory } from '../../simulation/common'
import { Particle, createGraphics } from '../Particle'
import { Vector2, distance } from '../../math/Vector2'
import { Rect } from '../../math/Rect'
import { Config, defaultConfig } from './config'
import { UI } from './ui'

export class ParticleLife implements Particle {
  private static _config = defaultConfig

  static get config() {
    return ParticleLife._config
  }

  static get ui() {
    return UI
  }

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

  graphics = createGraphics({
    type: 'circle',
    radius: 0,
    color: 0x0,
    x: 0,
    y: 0,
    strokeWidth: 0,
    strokeColor: 0x0,
    visible: true,
  })

  constructor(
    public id: ItemId,
    private storage: Storage<ParticleLife>,
    private world: World,
  ) {
    this.kind =
      ParticleLife._config.kinds[
        Math.floor(Random.next() * ParticleLife._config.kinds.length)
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
      ParticleLife._config.minRadius,
      Random.next() * ParticleLife._config.maxRadius,
    )
    this._rect = {
      x: this.position.x - this.radius,
      y: this.position.y - this.radius,
      width: this.radius * 2,
      height: this.radius * 2,
    }
    this._forceRect = {
      x: this.position.x - ParticleLife._config.forceRadius,
      y: this.position.y - ParticleLife._config.forceRadius,
      width: ParticleLife._config.forceRadius * 2,
      height: ParticleLife._config.forceRadius * 2,
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

      const collisionDistance = this.radius + other.radius
      if (d > 0 && d <= collisionDistance) {
        const f =
          (1 - d / collisionDistance) * ParticleLife._config.retractionForce

        fx -= f * dx
        fy -= f * dy
      }

      const socialForce =
        ParticleLife._config.rules[this.kind]?.[other.kind] ?? 0
      if (
        socialForce !== 0 &&
        d > collisionDistance &&
        d <= ParticleLife._config.forceRadius
      ) {
        const f = (socialForce * 1) / d

        fx += f * dx
        fy += f * dy
      }
    }

    const gd = distance(this.position, this.gravityCenter)
    fx +=
      ((this.gravityCenter.x - this.position.x) / gd) *
      ParticleLife._config.gravityForce
    fy +=
      ((this.gravityCenter.y - this.position.y) / gd) *
      ParticleLife._config.gravityForce

    this.velocity.x =
      (this.velocity.x + fx) * (1.0 - ParticleLife._config.damping)
    this.velocity.y =
      (this.velocity.y + fy) * (1.0 - ParticleLife._config.damping)
    this.position.x += this.velocity.x
    this.position.y += this.velocity.y

    this._rect.x = this.position.x - this.radius
    this._rect.y = this.position.y - this.radius
    this._forceRect.x = this.position.x - ParticleLife._config.forceRadius
    this._forceRect.y = this.position.y - ParticleLife._config.forceRadius

    this.graphics[0].color = ParticleLife._config.rules[this.kind]?.color ?? 0
    this.graphics[0].radius = this.radius
    this.graphics[0].x = this.position.x
    this.graphics[0].y = this.position.y
  }

  destroy() {}

  static create: ItemFactory<ParticleLife> = ({ id, storage, world }) => {
    return new ParticleLife(id, storage, world)
  }

  static updateConfig(value: Config) {
    ParticleLife._config = value
  }
}
