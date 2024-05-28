import { Storage, createId } from '../storage/Storage'
import { Item, ItemFactory, World } from './common'

type Config = {
  maxFPS: number
  speed: number
}

export class Simulation<I extends Item> {
  private deltaTime: number
  private frameTime: number

  constructor(
    private storage: Storage<I>,
    private world: World,
    config: Config = { maxFPS: 120, speed: 1 },
  ) {
    this.updateConfig(config)
    this.deltaTime = this.frameTime
  }

  updateConfig(config: Config) {
    this.frameTime =
      (1000 / config.maxFPS) * (1 / Math.min(1, Math.max(0, config.speed)))
  }

  start(itemsCount: number, createItem: ItemFactory<I>) {
    for (let i = 0; i < itemsCount; i++) {
      const id = createId(i)
      const item = createItem({
        id,
        world: this.world,
        storage: this.storage,
      })

      this.storage.add(i, item)
    }
  }

  stop() {
    for (const item of this.storage) {
      item.destroy()
      this.storage.delete(item.id)
    }
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
}
