import { Rect } from '../math/Rect'
import { Vector2 } from '../math/Vector2'
import { Storage, StorageItem } from './Storage'
import RBush, { BBox } from 'rbush'
import knn from 'rbush-knn'

class CustomRBush<Item extends StorageItem = StorageItem> extends RBush<Item> {
  toBBox(item: Item): BBox {
    return {
      minX: item.bbox.x,
      minY: item.bbox.y,
      maxX: item.bbox.x + item.bbox.width,
      maxY: item.bbox.y + item.bbox.height,
    }
  }
}

export class RBushStorage<Item extends StorageItem = StorageItem>
  implements Storage<Item>
{
  private tree: CustomRBush<Item>
  private items = new Map<number, Item>()

  constructor(config: { maxItemsPerNode: number } = { maxItemsPerNode: 9 }) {
    this.tree = new CustomRBush(config.maxItemsPerNode)
  }

  add(id: number, item: Item): void {
    this.items.set(id, item)
    this.tree.insert(item)
  }

  get(id: number): Item | null {
    return this.items.get(id) ?? null
  }

  delete(id: number): void {
    const item = this.items.get(id)
    if (!item) {
      return
    }

    this.items.delete(id)
    this.tree.remove(item)
  }

  update(id: number, bbox: Rect): void {
    const item = this.items.get(id)
    if (!item) {
      return
    }

    this.tree.remove(item)

    item.bbox.x = bbox.x
    item.bbox.y = bbox.y
    item.bbox.width = bbox.width
    item.bbox.height = bbox.height

    this.tree.insert(item)
  }

  intersecting(rect: Rect): IterableIterator<Item> {
    return this.tree
      .search({
        minX: rect.x,
        minY: rect.y,
        maxX: rect.x + rect.width,
        maxY: rect.y + rect.height,
      })
      .values()
  }

  nearest(point: Vector2): Item | null {
    return knn(this.tree, point.x, point.y, 1)[0] ?? null
  }

  __debug?: (ctx: CanvasRenderingContext2D) => void = (ctx) => {};

  [Symbol.iterator](): IterableIterator<Item> {
    return this.items.values()
  }
}