import { Random } from '../math/Random'
import { ItemId, Storage } from '../storage/Storage'
import { World, ItemFactory } from '../simulation/common'
import { Particle } from './Particle'
import { Vector2, distance } from '../math/Vector2'
import { Rect } from '../math/Rect'

const MAX_SPEED = 2
const MIN_SPEED = 1
const MAX_CONNECTIONS = Infinity
const RANGE = 100

export class Polygons implements Particle {
  private position: Vector2
  private velocity: Vector2
  private range: number
  private rangeBBox: Rect

  private _bbox: Rect
  private vertexes: (Vector2 & { distance: number })[] = []

  get bbox(): Rect {
    return this._bbox
  }

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
      x: Random.next() * MAX_SPEED - MIN_SPEED,
      y: Random.next() * MAX_SPEED - MIN_SPEED,
    }
    this._bbox = {
      x: this.position.x,
      y: this.position.y,
      width: 1,
      height: 1,
    }
    this.range = RANGE
    this.rangeBBox = {
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
    for (const other of this.storage.intersecting(this.rangeBBox)) {
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
        if (this.vertexes.length >= MAX_CONNECTIONS) {
          break
        }
      }
    }

    this.position.x += this.velocity.x
    this.position.y += this.velocity.y

    this._bbox.x = this.position.x
    this._bbox.y = this.position.y
    this.rangeBBox.x = this.position.x - this.range
    this.rangeBBox.y = this.position.y - this.range
  }

  render(ctx: CanvasRenderingContext2D) {
    const r = Math.floor((this.position.y / this.world.height) * 255)
    const b = Math.floor((this.position.x / this.world.width) * 255)
    const g = 50

    for (const vertex of this.vertexes) {
      const alpha = 1 - vertex.distance / RANGE
      ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`
      ctx.beginPath()
      ctx.moveTo(this.position.x, this.position.y)
      ctx.lineTo(vertex.x, vertex.y)
      ctx.closePath()
      ctx.stroke()
    }

    ctx.fillStyle = `rgb(255, 255, 255)`
    ctx.arc(this.position.x, this.position.y, 2, 0, Math.PI * 2)
    ctx.fill()
  }

  destroy() {
    this.vertexes = []
  }

  static create: ItemFactory<Polygons> = ({ id, storage, world }) => {
    return new Polygons(id, storage, world)
  }
}
