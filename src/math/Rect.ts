import { Vector2 } from './Vector2'

export type Rect = {
  x: number
  y: number
  width: number
  height: number
}

export function intersects(a: Rect, b: Rect): boolean {
  return (
    a.x <= b.x + b.width &&
    a.x + a.width >= b.x &&
    a.y <= b.y + b.height &&
    a.y + a.height >= b.y
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

export function copyRect(dest: Rect, source: Rect): void {
  dest.x = source.x
  dest.y = source.y
  dest.width = source.width
  dest.height = source.height
}

function axisDistance(k: number, min: number, max: number) {
  return k < min ? min - k : k <= max ? 0 : k - max
}

export function rectQuadDistance(point: Vector2, rect: Rect): number {
  const dx = axisDistance(point.x, rect.x, rect.x + rect.width)
  const dy = axisDistance(point.y, rect.y, rect.y + rect.height)

  return dx * dx + dy * dy
}
