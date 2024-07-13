import { Rect } from '../math/Rect'
import { Vector2 } from '../math/Vector2'

export type ItemId = number

export type StorageItem = {
  id: ItemId
  rect: Rect
}

export interface Storage<Item extends StorageItem = StorageItem>
  extends Iterable<Item> {
  add(id: ItemId, item: Item): void
  get(id: ItemId): Item | null
  delete(id: ItemId): void
  update(id: ItemId, rect: Rect): void

  intersecting(rect: Rect): IterableIterator<Item>
  nearest(point: Vector2, k: number): IterableIterator<Item>

  [Symbol.iterator](): IterableIterator<Item>

  __debug?: (ctx: CanvasRenderingContext2D) => void
}

export function createId(seed: number): ItemId {
  return seed
}
