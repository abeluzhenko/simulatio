import { Rect } from '../math/Rect'
import { Vector2 } from '../math/Vector2'

export type ItemId = number

export type StorageItem = {
  bbox: Rect
}

export interface Storage<Item extends StorageItem = StorageItem>
  extends Iterable<Item> {
  add(id: ItemId, item: Item): void
  get(id: ItemId): Item | undefined
  delete(id: ItemId): void
  update(id: ItemId, bbox: Rect): void

  intersecting(rect: Rect): IterableIterator<Item>
  nearest(point: Vector2): Item | null

  [Symbol.iterator](): IterableIterator<Item>
}

export function createId(seed: number): ItemId {
  return seed
}
