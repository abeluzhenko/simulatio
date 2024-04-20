import { PriorityQueue } from '../common/PriorityQueue'
import {
  Rect,
  containsPoint,
  containsRect,
  copyRect,
  intersects,
} from '../math/Rect'
import { Vector2, distance } from '../math/Vector2'
import { Storage, ItemId, StorageItem } from './Storage'

type QuadNode<Item> = {
  rect: Rect
  children: [
    topLeft: QuadNode<Item> | null,
    topRight: QuadNode<Item> | null,
    bottomRight: QuadNode<Item> | null,
    bottomLeft: QuadNode<Item> | null,
  ]
  items: Set<Item>
  parent?: QuadNode<Item>
}

enum ChildIndex {
  TopLeft,
  TopRight,
  BottomRight,
  BottomLeft,
}

export class SimpleQTStorage<Item extends StorageItem = StorageItem>
  implements Storage<Item>
{
  private tree: QuadNode<Item>
  private items: Map<ItemId, Item> = new Map()
  private itemToNode: Map<Item, QuadNode<Item>> = new Map()

  constructor(
    rect: Rect,
    private config: { maxItemsPerNode: number; maxDepth: number } = {
      maxItemsPerNode: 5,
      maxDepth: 8,
    },
  ) {
    this.tree = { rect, items: new Set(), children: [null, null, null, null] }
  }

  add(id: ItemId, item: Item) {
    this.insertItem(item, this.tree)
    this.items.set(id, item)
  }

  get(id: ItemId) {
    return this.items.get(id) ?? null
  }

  update(id: ItemId, rect: Rect) {
    const item = this.items.get(id)
    if (!item) {
      return
    }

    this.removeItem(item)

    copyRect(item.rect, rect)

    this.insertItem(item, this.tree)
  }

  delete(id: ItemId) {
    const item = this.items.get(id)
    if (!item) {
      return
    }

    this.items.delete(id)
    this.removeItem(item)
  }

  private getChildIndex(rect: Rect, point: Vector2): ChildIndex {
    const centerX = rect.x + rect.width / 2
    const centerY = rect.y + rect.height / 2

    if (point.x < centerX) {
      return point.y < centerY ? ChildIndex.TopLeft : ChildIndex.BottomLeft
    }
    return point.y < centerY ? ChildIndex.TopRight : ChildIndex.BottomRight
  }

  private createChildNodeRect(rect: Rect, childIndex: ChildIndex): Rect {
    const { x, y, width, height } = rect
    const hw = width / 2
    const hh = height / 2

    switch (childIndex) {
      case ChildIndex.TopLeft:
        return { x, y, width: hw, height: hh }
      case ChildIndex.TopRight:
        return { x: x + hw, y, width: hw, height: hh }
      case ChildIndex.BottomRight:
        return { x: x + hw, y: y + hh, width: hw, height: hh }
      case ChildIndex.BottomLeft:
        return { x, y: y + hh, width: hw, height: hh }
    }
  }

  private insertItem(item: Item, node: QuadNode<Item>, depth = 0) {
    const childIndex = this.getChildIndex(node.rect, item.rect)
    const childRect = node.children[childIndex]
      ? node.children[childIndex]!.rect
      : this.createChildNodeRect(node.rect, childIndex)

    if (
      node.items.size >= this.config.maxItemsPerNode &&
      depth < this.config.maxDepth &&
      containsRect(childRect, item.rect)
    ) {
      if (!node.children[childIndex]) {
        node.children[childIndex] = {
          rect: childRect,
          items: new Set(),
          children: [null, null, null, null],
          parent: node,
        }
      }

      this.insertItem(item, node.children[childIndex]!, depth + 1)

      return
    }

    node.items.add(item)
    this.itemToNode.set(item, node)
  }

  private removeItem(item: Item) {
    const node = this.itemToNode.get(item)
    if (!node) {
      return
    }

    node.items.delete(item)
    this.itemToNode.delete(item)

    this.cleanupUpwards(node)
  }

  private cleanupUpwards(node: QuadNode<Item>) {
    if (
      node.parent &&
      node.items.size === 0 &&
      node.children.every((c) => c === null)
    ) {
      const index = node.parent.children.indexOf(node)
      node.parent.children[index] = null
      this.cleanupUpwards(node.parent)
    }
  }

  *intersecting(rect: Rect): IterableIterator<Item> {
    const stack: (QuadNode<Item> | null)[] = [this.tree]

    while (stack.length) {
      const node = stack.pop()
      if (!node || !intersects(node.rect, rect)) {
        continue
      }

      if (node.items) {
        for (const item of node.items) {
          if (intersects(item.rect, rect)) {
            yield item
          }
        }
      }

      stack.push(...node.children)
    }
  }

  *nearest(point: Vector2, k: number): IterableIterator<Item> {
    const queue = new PriorityQueue<Item>(
      (a, b) => distance(point, a.rect) - distance(point, b.rect),
    )

    const stack: (QuadNode<Item> | null)[] = [this.tree]

    while (stack.length) {
      const node = stack.pop()
      if (!node || !containsPoint(node.rect, point)) {
        continue
      }

      if (node.items) {
        for (const item of node.items) {
          queue.push(item)
        }
      }

      stack.push(...node.children)
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
    return this.items.values()
  }

  __debug(ctx: CanvasRenderingContext2D) {
    const stack: (QuadNode<Item> | null)[] = [this.tree]
    const nodes: QuadNode<Item>[] = []
    const items: Rect[] = []

    while (stack.length) {
      const node = stack.pop()
      if (!node) {
        continue
      }

      nodes.push(node)

      if (node.items.size) {
        for (const item of node.items) {
          items.push(item.rect)
        }
      }

      if (node.children) {
        stack.push(...node.children)
      }
    }

    ctx.strokeStyle = 'rgb(0, 255, 0)'
    ctx.fillStyle = 'rgb(0, 255, 0)'
    ctx.font = '8px Arial'
    for (const node of nodes) {
      const rect = node.rect
      ctx.strokeRect(rect.x, rect.y, rect.width, rect.height)
      ctx.fillText(`${node.items.size}`, rect.x + 6, rect.y + 10)
    }

    ctx.strokeStyle = 'rgb(255, 255, 0)'
    for (const item of items) {
      ctx.strokeRect(item.x, item.y, item.width, item.height)
    }
  }
}
