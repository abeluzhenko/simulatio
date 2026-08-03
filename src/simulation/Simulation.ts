import { Storage, createId } from '../storage/Storage'
import { Item, ItemFactory, World } from './common'

type Config<I extends Item> = {
  maxFPS: number
  speed: number
  factory: ItemFactory<I>
  multiStepPhysics?: boolean
}

export class Simulation<I extends Item> {
  private deltaTime = 0
  private frameTime: number
  private population = 0
  private factory: ItemFactory<I>
  private multiStepPhysics: boolean

  constructor(
    private storage: Storage<I>,
    private world: World,
    config: Config<I>,
  ) {
    this.setSpeed(config.speed, config.maxFPS)
    this.setFactory(config.factory)
    this.multiStepPhysics = config.multiStepPhysics ?? false
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

    if (this.multiStepPhysics) {
      // Fixed timestep mode: Run physics multiple times if needed
      while (this.deltaTime >= this.frameTime) {
        for (const item of this.storage) {
          item.update(this.storage, this.world, this.frameTime)
        }

        // Update spatial index AFTER all particles have updated positions
        // This ensures consistent spatial queries (like ECS)
        for (const item of this.storage) {
          this.storage.update(item.id, item.rect)
        }

        for (const item of this.storage) {
          item.afterUpdate?.()
        }

        this.deltaTime -= this.frameTime
      }
    } else {
      // Variable timestep mode: Run physics once, scaled by actual dt
      for (const item of this.storage) {
        item.update(this.storage, this.world, this.deltaTime)
      }

      // Update spatial index AFTER all particles have updated positions
      // This ensures consistent spatial queries (like ECS) instead of having
      // early particles see old positions while late particles see new ones
      for (const item of this.storage) {
        this.storage.update(item.id, item.rect)
      }

      for (const item of this.storage) {
        item.afterUpdate?.()
      }

      this.deltaTime = 0
    }
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
