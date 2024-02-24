import { Random } from '../math/Random'
import { Rect } from '../math/Rect'
import { Vector2 } from '../math/Vector2'
import { ItemFactory, World } from '../simulation/common'
import { ItemId, Storage } from '../storage/Storage'
import { Particle } from './common'

const STEP_TIME_MS = 80

export class ConveyLife implements Particle {
  private position: Vector2
  private state: boolean
  private nextState: boolean
  private _bbox: Rect
  private timeFromLastStep = 0

  private static particleCount: number
  private static gridSize: Vector2
  private static size: number
  private static needSetup = true

  get bbox(): Rect {
    return this._bbox
  }

  constructor(
    public id: ItemId,
    private storage: Storage<ConveyLife>,
    gridSize = ConveyLife.gridSize,
    size = ConveyLife.size,
  ) {
    this.position = {
      x: (this.id % gridSize.x) * size,
      y: Math.floor(this.id / gridSize.x) * size,
    }

    this._bbox = {
      x: this.position.x,
      y: this.position.y,
      width: size,
      height: size,
    }

    this.state = Random.next() > 0.5
    this.nextState = this.state
  }

  update(_storage: Storage<ConveyLife>, _world: World, dt: number): void {
    if (this.id >= ConveyLife.particleCount) {
      return
    }

    if (this.timeFromLastStep < STEP_TIME_MS) {
      this.timeFromLastStep += dt
      return
    }
    this.timeFromLastStep = 0

    let aliveNeighbors = 0
    for (const neighbor of this.neighbors()) {
      if (neighbor.state) {
        aliveNeighbors++
      }
    }

    if (this.state) {
      if (aliveNeighbors < 2 || aliveNeighbors > 3) {
        this.nextState = false
      }
    } else if (aliveNeighbors === 3) {
      this.nextState = true
    }
  }

  afterUpdate(): void {
    this.state = this.nextState
  }

  destroy(): void {}

  render(ctx: CanvasRenderingContext2D): void {
    if (this.id >= ConveyLife.particleCount) {
      return
    }
    if (!this.nextState && !this.state) {
      return
    }

    ctx.fillStyle = '#00ff00'
    ctx.fillRect(
      this.position.x,
      this.position.y,
      ConveyLife.size,
      ConveyLife.size,
    )
    ctx.fill()
  }

  private *neighbors(): IterableIterator<ConveyLife> {
    const cols = ConveyLife.gridSize.x
    const rows = ConveyLife.gridSize.y
    const curCol = this.id % cols
    const curRow = Math.floor(this.id / cols)

    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        if (i === 0 && j === 0) continue

        let row = curRow + i
        if (row < 0) {
          row = rows - 1
        } else if (row >= rows) {
          row = row % rows
        }

        let col = curCol + j
        if (col < 0) {
          col = cols - 1
        } else if (col >= cols) {
          col = col % cols
        }

        const id = col + row * cols
        const item = this.storage.get(id)

        if (!item) {
          throw new Error(`Item with id ${id} not found`)
        }

        yield item
      }
    }
  }

  static setup(world: World): void {
    ConveyLife.size = Math.ceil(
      Math.sqrt((world.width * world.height) / world.particleCount),
    )

    ConveyLife.gridSize = {
      x: Math.floor(world.width / this.size),
      y: Math.floor(world.height / this.size),
    }

    ConveyLife.particleCount = this.gridSize.x * this.gridSize.y
    ConveyLife.needSetup = false
  }

  static create: ItemFactory<ConveyLife> = ({ id, storage, world }) => {
    if (ConveyLife.needSetup) {
      ConveyLife.setup(world)
    }
    return new ConveyLife(id, storage, ConveyLife.gridSize, ConveyLife.size)
  }
}
