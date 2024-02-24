import { Storage } from '../storage/Storage'
import { Item, ItemFactory, World } from './common'

export class Simulation<I extends Item> {
  constructor(
    private storage: Storage<I>,
    private world: World,
  ) {}

  start(itemsCount: number, createItem: ItemFactory<I>) {
    for (let i = 0; i < itemsCount; i++) {
      const id = this.storage.createId(i)
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
    for (const item of this.storage) {
      item.update(this.storage, this.world, dt)
    }
    for (const item of this.storage) {
      item.afterUpdate?.()
    }
  }
}
