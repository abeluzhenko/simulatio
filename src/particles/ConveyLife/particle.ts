import { createColor } from '../../math/Color'
import { Random } from '../../math/Random'
import { Rect } from '../../math/Rect'
import { Vector2 } from '../../math/Vector2'
import { ItemFactory, World } from '../../simulation/common'
import { ItemId, Storage } from '../../storage/Storage'
import { Particle, createGraphics } from './../Particle'
import { Config, defaultConfig } from './config'
import { UI } from './ui'

export class ConveyLife implements Particle {
  private static _config = defaultConfig

  static get config() {
    return ConveyLife._config
  }

  static get ui() {
    return UI
  }

  private position: Vector2
  private state: boolean
  private nextState: boolean
  private _rect: Rect
  private timeFromLastStep = 0

  private static particleCount: number
  private static gridSize: Vector2
  private static size: number
  private static needSetup = true

  get rect(): Rect {
    return this._rect
  }

  graphics = createGraphics({
    type: 'rectangle',
    color: 0x0,
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    strokeWidth: 0,
    strokeColor: 0x0,
    visible: true as boolean,
  })

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

    this._rect = {
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

    if (this.timeFromLastStep < ConveyLife.config.stepTimeMs) {
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

    const isHidden =
      this.id >= ConveyLife.particleCount || (!this.state && !this.nextState)

    this.graphics[0].visible = !isHidden
    this.graphics[0].color = createColor(0, 255, 0, 1)
    this.graphics[0].x = this.position.x
    this.graphics[0].y = this.position.y
    this.graphics[0].width = ConveyLife.size
    this.graphics[0].height = ConveyLife.size
    this.graphics[0].strokeWidth = ConveyLife.config.borderSize
    this.graphics[0].strokeColor = createColor(255, 255, 255, 1)
  }

  afterUpdate(): void {
    this.state = this.nextState
  }

  destroy(): void {}

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

  static updateConfig(value: Config) {
    ConveyLife._config = value
  }
}
