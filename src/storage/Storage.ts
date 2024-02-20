import { Rect, intersects } from '../math/Rect'
import { Vector2, distance } from '../math/Vector2'

export type ItemId = number

type StorageItem = {
  bbox: Rect
}

export class Storage<Item extends StorageItem = StorageItem>
  implements Iterable<Item>
{
  private data = new Map<ItemId, Item>()

  createId(seed: number): ItemId {
    return seed
  }

  add(id: ItemId, item: Item) {
    this.data.set(id, item)
  }

  get(id: ItemId) {
    return this.data.get(id)
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
