import { Random } from '../../math/Random'
import { ItemId, Storage } from '../../storage/Storage'
import { World, ItemFactory } from '../../simulation/common'
import { Particle, createGraphics } from '../Particle'
import { Vector2, distance } from '../../math/Vector2'
import { Rect } from '../../math/Rect'
import { Config, defaultConfig } from './config'
import { UI } from './ui'
import { createColor } from '../../math/Color'
import { Line } from '../../render/Graphics'

export class Polygons implements Particle {
  private static _config = defaultConfig

  static get config() {
    return Polygons._config
  }

  static get ui() {
    return UI
  }

  private position: Vector2
  private velocity: Vector2
  private range: number
  private rangeRect: Rect

  private _rect: Rect
  private vertexes: (Vector2 & { distance: number })[] = []

  get rect(): Rect {
    return this._rect
  }

  graphics = createGraphics(
    {
      type: 'circle',
      radius: 0,
      color: 0x0,
      x: 0,
      y: 0,
      strokeWidth: 0,
      strokeColor: 0x0,
      visible: true,
    },
    {
      type: 'line',
      x1: 0,
      y1: 0,
      x2: 0,
      y2: 0,
      strokeWidth: 2,
      strokeColor: 0x0,
      color: 0x0,
      visible: true as boolean,
    },
  )

  constructor(
    public id: ItemId,
    private storage: Storage<Polygons>,
    private world: World,
  ) {
    this.position = {
      x: Random.next() * world.width,
      y: Random.next() * world.height,
    }
    this.velocity = {
      x: Random.next() * Polygons._config.maxSpeed - Polygons._config.minSpeed,
      y: Random.next() * Polygons._config.maxSpeed - Polygons._config.minSpeed,
    }
    this._rect = {
      x: this.position.x,
      y: this.position.y,
      width: 1,
      height: 1,
    }
    this.range = Polygons._config.range
    this.rangeRect = {
      x: this.position.x - this.range,
      y: this.position.y - this.range,
      width: this.range * 2,
      height: this.range * 2,
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

    this.vertexes = []
    for (const other of this.storage.intersecting(this.rangeRect)) {
      if (other === this) {
        continue
      }

      const d = distance(nextPos, other.position)
      if (d <= this.range) {
        this.vertexes.push({
          x: other.position.x,
          y: other.position.y,
          distance: d,
        })
        if (this.vertexes.length >= Polygons._config.maxConnections) {
          break
        }
      }
    }

    this.position.x += this.velocity.x
    this.position.y += this.velocity.y

    this._rect.x = this.position.x
    this._rect.y = this.position.y
    this.rangeRect.x = this.position.x - this.range
    this.rangeRect.y = this.position.y - this.range

    const r = Math.floor((this.position.y / this.world.height) * 255)
    const b = Math.floor((this.position.x / this.world.width) * 255)
    const g = 50
    for (let i = 0; i < this.vertexes.length; i++) {
      const line = (this.graphics[i + 1] ?? {
        type: 'line',
        visible: true,
      }) as Line
      const a = 1 - this.vertexes[i].distance / Polygons._config.range
      line.strokeColor = createColor(r, g, b, a)
      line.strokeWidth = 2
      line.x1 = this.position.x
      line.y1 = this.position.y
      line.x2 = this.vertexes[i].x
      line.y2 = this.vertexes[i].y
      this.graphics[i + 1] = line
    }

    this.graphics[0].x = this.position.x
    this.graphics[0].y = this.position.y
    this.graphics[0].radius = 2
    this.graphics[0].color = 0xffffffff

    // @ts-expect-error the fastest way to remove elements from array
    this.graphics.length = this.vertexes.length + 1
  }

  destroy() {
    this.vertexes = []
  }

  static create: ItemFactory<Polygons> = ({ id, storage, world }) => {
    return new Polygons(id, storage, world)
  }

  static updateConfig(value: Config) {
    this._config = value
  }
}
