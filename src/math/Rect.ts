import { Vector2 } from './Vector2'

export type Rect = {
  x: number
  y: number
  width: number
  height: number
}

export function intersects(a: Rect, b: Rect): boolean {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  )
}

export function containsPoint(rect: Rect, point: Vector2): boolean {
  return (
    point.x >= rect.x &&
    point.x <= rect.x + rect.width &&
    point.y >= rect.y &&
    point.y <= rect.y + rect.height
  )
}

export function containsRect(container: Rect, rect: Rect): boolean {
  return (
    rect.x >= container.x &&
    rect.x + rect.width <= container.x + container.width &&
    rect.y >= container.y &&
    rect.y + rect.height <= container.y + container.height
  )
}
