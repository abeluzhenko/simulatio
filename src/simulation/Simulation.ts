import { Storage, createId } from '../storage/Storage'
import { Item, ItemFactory, World } from './common'

type Config<I extends Item> = {
  maxFPS: number
  speed: number
  factory: ItemFactory<I>
}

export class Simulation<I extends Item> {
  private deltaTime: number
  private frameTime: number
  private population = 0
  private factory: ItemFactory<I>

  constructor(
    private storage: Storage<I>,
    private world: World,
    config: Config<I>,
  ) {
    this.deltaTime = this.frameTime
    this.setSpeed(config.speed, config.maxFPS)
    this.setFactory(config.factory)
  }

  setFactory(value: ItemFactory<I>) {
    this.factory = value
  }

  setSpeed(speed: number, maxFPS: number) {
    this.frameTime = (1000 / maxFPS) * (1 / Math.min(1, Math.max(0, speed)))
  }

  setPopulation(population: number) {
    if (population < this.population) {
      this.destroyItems(this.population - population)
    } else if (population > this.population) {
      this.createItems(population - this.population)
    }

    this.population = population
  }

  start(population: number) {
    if (this.population > 0) {
      throw new Error('Starting simulation while the population is not 0')
    }
    this.setPopulation(population)
  }

  stop() {
    this.destroyItems(this.population)
  }

  tick(dt: number) {
    this.deltaTime += dt
    if (this.deltaTime < this.frameTime) {
      return
    }

    for (const item of this.storage) {
      item.update(this.storage, this.world, dt)

      this.storage.update(item.id, item.rect)
    }

    for (const item of this.storage) {
      item.afterUpdate?.()
    }
    this.deltaTime = 0
  }

  private createItems(n: number) {
    for (let i = 0; i < n; i++) {
      const id = createId(this.population + i)
      const item = this.factory({
        id,
        world: this.world,
        storage: this.storage,
      })

      this.storage.add(id, item)
    }
  }

  private destroyItems(n: number) {
    for (let i = 0; i < n; i++) {
      const id = createId(this.population - i)
      const item = this.storage.get(id)
      this.storage.delete(id)
      item?.destroy()
    }
  }
}
