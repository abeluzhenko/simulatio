import { Rect, copyRect, intersects } from '../math/Rect'
import { Vector2, distance } from '../math/Vector2'
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

  nearest(point: Vector2): Item | null {
    let minDist = Infinity
    let nearest: Item | null = null

    for (const item of this) {
      const dist = distance(point, item.rect)
      if (dist < minDist) {
        minDist = dist
        nearest = item
      }
    }

    return nearest
  }

  [Symbol.iterator]() {
    return this.data.values()
  }
}
