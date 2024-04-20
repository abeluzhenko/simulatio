import { Rect, intersects } from '../math/Rect'
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

  update(id: ItemId, bbox: Rect) {
    const item = this.data.get(id)
    if (!item) {
      return
    }
    item.bbox.x = bbox.x
    item.bbox.y = bbox.y
    item.bbox.width = bbox.width
    item.bbox.height = bbox.height
  }

  delete(id: ItemId) {
    this.data.delete(id)
  }

  *intersecting(rect: Rect): IterableIterator<Item> {
    for (const item of this) {
      if (intersects(rect, item.bbox)) {
        yield item
      }
    }
  }

  nearest(point: Vector2): Item | null {
    let minDist = Infinity
    let nearest: Item | null = null

    for (const item of this) {
      const dist = distance(point, item.bbox)
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
