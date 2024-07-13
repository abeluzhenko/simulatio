import { Rect, copyRect } from '../math/Rect'
import { Vector2 } from '../math/Vector2'
import { Storage, ItemId, StorageItem } from './Storage'
import QuadTree from 'simple-quadtree'
import { getNearestQuadCompareFn } from './common'

type TreeNode<Item> = {
  id: number
  x: number
  y: number
  w: number
  h: number
  owner: Item
}

export class SimpleQTStorage<Item extends StorageItem = StorageItem>
  implements Storage<Item>
{
  private tree: QuadTree<TreeNode<Item>>
  private items = new Map<ItemId, Item>()
  private itemToNode = new Map<ItemId, TreeNode<Item>>()

  constructor(
    rect: Rect,
    config: { maxChildren: number; leafRatio: number } = {
      maxChildren: 25,
      leafRatio: 0.5,
    },
  ) {
    this.tree = new QuadTree(rect.x, rect.y, rect.width, rect.height, {
      maxchildren: config.maxChildren,
      leafratio: config.leafRatio,
    })
  }

  add(id: ItemId, item: Item) {
    this.items.set(id, item)

    const treeItem = {
      id,
      x: item.rect.x,
      y: item.rect.y,
      w: item.rect.width,
      h: item.rect.height,
      owner: item,
    }
    this.tree.put(treeItem)

    this.itemToNode.set(id, treeItem)
  }

  get(id: ItemId) {
    return this.items.get(id) ?? null
  }

  update(id: ItemId, rect: Rect) {
    const item = this.items.get(id)
    if (!item) {
      return
    }

    copyRect(item.rect, rect)

    const node = this.itemToNode.get(id)
    if (!node) {
      return
    }

    this.tree.update(node, 'id', {
      x: rect.x,
      y: rect.y,
      w: rect.width,
      h: rect.height,
    })
  }

  delete(id: ItemId) {
    this.items.delete(id)

    const node = this.itemToNode.get(id)
    if (node) {
      this.tree.remove(node, 'id')
    }
  }

  *intersecting(rect: Rect): IterableIterator<Item> {
    for (const node of this.tree.get({
      x: rect.x,
      y: rect.y,
      w: rect.width,
      h: rect.height,
    })) {
      yield node.owner
    }
  }

  // @todo: this is VERY inefficient, need to be optimized
  *nearest(point: Vector2, k: number): IterableIterator<Item> {
    const sorted = Array.from(this.items.values()).sort(
      getNearestQuadCompareFn(point),
    )
    for (let i = 0; i < k && i < sorted.length; i++) {
      yield sorted[i]
    }
  }

  [Symbol.iterator]() {
    return this.items.values()
  }
}
