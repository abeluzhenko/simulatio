export type Vector2 = {
  x: number
  y: number
}

export function quadDistance(a: Vector2, b: Vector2): number {
  const dx = a.x - b.x
  const dy = a.y - b.y
  return dx * dx + dy * dy
}

export function distance(a: Vector2, b: Vector2): number {
  return Math.sqrt(quadDistance(a, b))
}

export function rotate(v: Vector2, angle: number): Vector2 {
  const cos = Math.cos(angle)
  const sin = Math.sin(angle)
  return {
    x: v.x * cos - v.y * sin,
    y: v.x * sin + v.y * cos,
  }
}

export function normalize(v: Vector2): Vector2 {
  const len = Math.sqrt(v.x * v.x + v.y * v.y)
  return {
    x: v.x / len,
    y: v.y / len,
  }
}
