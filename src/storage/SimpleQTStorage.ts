import { Rect, containsPoint, containsRect, intersects } from '../math/Rect'
import { Vector2, distance } from '../math/Vector2'
import { Storage, ItemId, StorageItem } from './Storage'

type QuadNode<Item> = {
  bbox: Rect
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

  constructor(bbox: Rect) {
    this.tree = { bbox, items: new Set(), children: [null, null, null, null] }
  }

  add(id: ItemId, item: Item) {
    this.insertItem(item, this.tree)
    this.items.set(id, item)
  }

  get(id: ItemId) {
    return this.items.get(id)
  }

  update(id: ItemId, bbox: Rect) {
    const item = this.items.get(id)
    if (!item) {
      return
    }

    this.removeItem(item)

    item.bbox.x = bbox.x
    item.bbox.y = bbox.y
    item.bbox.width = bbox.width
    item.bbox.height = bbox.height

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

  private getChildIndex(bbox: Rect, point: Vector2): ChildIndex {
    const centerX = bbox.x + bbox.width / 2
    const centerY = bbox.y + bbox.height / 2

    if (point.x < centerX) {
      return point.y < centerY ? ChildIndex.TopLeft : ChildIndex.BottomLeft
    }
    return point.y < centerY ? ChildIndex.TopRight : ChildIndex.BottomRight
  }

  private createChildNodeBbox(bbox: Rect, childIndex: ChildIndex): Rect {
    const { x, y, width, height } = bbox
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

  private insertItem(item: Item, node: QuadNode<Item>) {
    const childIndex = this.getChildIndex(node.bbox, item.bbox)
    const childBbox = node.children[childIndex]
      ? node.children[childIndex].bbox
      : this.createChildNodeBbox(node.bbox, childIndex)

    if (containsRect(childBbox, item.bbox)) {
      if (!node.children[childIndex]) {
        node.children[childIndex] = {
          bbox: childBbox,
          items: new Set(),
          children: [null, null, null, null],
          parent: node,
        }
      }

      this.insertItem(item, node.children[childIndex])

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
      if (!node || !intersects(node.bbox, rect)) {
        continue
      }

      if (node.items) {
        for (const item of node.items) {
          if (intersects(item.bbox, rect)) {
            yield item
          }
        }
      }

      stack.push(...node.children)
    }
  }

  nearest(point: Vector2): Item | null {
    let minDist = Infinity
    let nearest: Item | null = null

    const stack: (QuadNode<Item> | null)[] = [this.tree]

    while (stack.length) {
      const node = stack.pop()
      if (!node || !containsPoint(node.bbox, point)) {
        continue
      }

      if (node.items) {
        for (const item of node.items) {
          const dist = distance(point, item.bbox)
          if (dist < minDist) {
            minDist = dist
            nearest = item
          }
        }
      }

      stack.push(...node.children)
    }

    return nearest
  }

  [Symbol.iterator]() {
    return this.items.values()
  }

  __debug(ctx: CanvasRenderingContext2D) {
    const stack: (QuadNode<Item> | null)[] = [this.tree]
    const rects: Rect[] = []
    const items: Rect[] = []

    while (stack.length) {
      const node = stack.pop()
      if (!node) {
        continue
      }

      rects.push(node.bbox)

      if (node.items.size) {
        for (const item of node.items) {
          items.push(item.bbox)
        }
      }

      if (node.children) {
        stack.push(...node.children)
      }
    }

    ctx.strokeStyle = 'rgb(0, 255, 0)'
    for (const rect of rects) {
      ctx.beginPath()
      ctx.strokeRect(rect.x, rect.y, rect.width, rect.height)
      ctx.stroke()
    }

    ctx.strokeStyle = 'rgb(255, 255, 0)'
    for (const item of items) {
      ctx.beginPath()
      ctx.strokeRect(item.x, item.y, item.width, item.height)
      ctx.stroke()
    }
  }
}
