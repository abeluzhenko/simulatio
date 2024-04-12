import { Rect } from '../math/Rect'
import { Vector2 } from '../math/Vector2'

export type ItemId = number

type StorageItem = {
  bbox: Rect
}

export interface Storage<Item extends StorageItem = StorageItem>
  extends Iterable<Item> {
  add(id: ItemId, item: Item): void
  get(id: ItemId): Item | undefined
  delete(id: ItemId): void

  intersecting(rect: Rect): IterableIterator<Item>
  nearest(point: Vector2): Item | null

  [Symbol.iterator](): IterableIterator<Item>
}
