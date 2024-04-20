import { Rect, copyRect, intersects } from '../math/Rect'
import { Vector2, distance } from '../math/Vector2'
import { PriorityQueue } from '../common/PriorityQueue'
import { Storage, ItemId, StorageItem } from './Storage'

export class SimpleStorage<Item extends StorageItem = StorageItem>
  implements Storage<Item>
{
  private data = new Map<ItemId, Item>()

  add(id: ItemId, item: Item) {
    this.data.set(id, item)
  }

  get(id: ItemId) {
    return this.data.get(id) ?? null
  }

  update(id: ItemId, rect: Rect) {
    const item = this.data.get(id)
    if (!item) {
      return
    }
    copyRect(item.rect, rect)
  }

  delete(id: ItemId) {
    this.data.delete(id)
  }

  *intersecting(rect: Rect): IterableIterator<Item> {
    for (const item of this) {
      if (intersects(rect, item.rect)) {
        yield item
      }
    }
  }

  *nearest(point: Vector2, k: number): IterableIterator<Item> {
    const queue = new PriorityQueue<Item>(
      (a, b) => distance(point, a.rect) - distance(point, b.rect),
    )

    for (const item of this) {
      queue.push(item)
    }

    for (let i = 0; i < k; i++) {
      const item = queue.pop()
      if (!item) {
        break
      }

      yield item
    }
  }

  [Symbol.iterator]() {
    return this.data.values()
  }
}
