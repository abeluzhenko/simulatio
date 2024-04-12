import { Rect, containsRect, intersects } from '../math/Rect'
import { Vector2, distance } from '../math/Vector2'
import { Storage, ItemId, StorageItem } from './Storage'

type QuadNode<Item> = {
  children?: [
    topLeft: QuadNode<Item>,
    topRight: QuadNode<Item>,
    bottomRight: QuadNode<Item>,
    bottomLeft: QuadNode<Item>,
  ]
  bbox: Rect
  items?: Set<Item>
}

export class SimpleQTStorage<Item extends StorageItem = StorageItem>
  implements Storage<Item>
{
  private tree: QuadNode<Item>
  private items: Map<ItemId, Item>

  constructor(bbox: Rect) {
    this.tree = { bbox }
    this.items = new Map()
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

    this.removeItem(item, this.tree)

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
    this.removeItem(item, this.tree)
  }

  private insertItem(item: Item, node: QuadNode<Item>) {
    if (!containsRect(node.bbox, item.bbox)) {
      throw new Error('Item is out of bounds')
    }

    if (!node.children) {
      const { bbox } = node
      const hw = bbox.width / 2
      const hh = bbox.height / 2
      node.children = [
        {
          bbox: { x: bbox.x, y: bbox.y, width: hw, height: hh },
        },
        {
          bbox: { x: bbox.x + hw, y: bbox.y, width: hw, height: hh },
        },
        {
          bbox: { x: bbox.x + hw, y: bbox.y + hh, width: hw, height: hh },
        },
        {
          bbox: { x: bbox.x, y: bbox.y + hh, width: hw, height: hh },
        },
      ]
    }

    for (const childNode of node.children) {
      if (containsRect(childNode.bbox, item.bbox)) {
        this.insertItem(item, childNode)
        return
      }
    }

    if (!node.items) {
      node.items = new Set()
    }
    node.items.add(item)
  }

  private removeItem(item: Item, node: QuadNode<Item>) {
    if (!containsRect(node.bbox, item.bbox)) {
      throw new Error('Item is out of bounds')
    }

    if (node.items && node.items.has(item)) {
      node.items.delete(item)
      return
    }

    if (!node.children) {
      return
    }

    for (const childNode of node.children) {
      if (containsRect(childNode.bbox, item.bbox)) {
        this.removeItem(item, childNode)
      }
    }
  }

  *intersecting(rect: Rect): IterableIterator<Item> {
    const stack: QuadNode<Item>[] = [this.tree]

    while (stack.length) {
      const node = stack.pop()!
      if (!intersects(node.bbox, rect)) {
        continue
      }

      if (node.items) {
        for (const item of node.items) {
          if (intersects(item.bbox, rect)) {
            yield item
          }
        }
      }

      if (node.children) {
        stack.push(...node.children)
      }
    }
  }

  nearest(point: Vector2): Item | null {
    let minDist = Infinity
    let nearest: Item | null = null

    const stack: QuadNode<Item>[] = [this.tree]

    while (stack.length) {
      const node = stack.pop()!
      if (
        !intersects(node.bbox, { x: point.x, y: point.y, width: 0, height: 0 })
      ) {
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

      if (node.children) {
        stack.push(...node.children)
      }
    }

    return nearest
  }

  [Symbol.iterator]() {
    return this.items.values()
  }
}
