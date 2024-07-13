import { Rect, rectQuadDistance } from '../../math/Rect'
import { Vector2 } from '../../math/Vector2'

export const AREA_SIZE = 10_000

export type TestItem = { id: number; rect: Rect }

export function generateRandomRect(
  maxWidth = 500,
  maxHeight = 500,
  minWidth = 20,
  minHeight = 20,
  maxX = AREA_SIZE,
  maxY = AREA_SIZE,
): Rect {
  const width = Math.floor(Math.random() * (maxWidth - minWidth + 1)) + minWidth
  const height =
    Math.floor(Math.random() * (maxHeight - minHeight + 1)) + minHeight

  const { x, y } = generateRandomPoint(maxX - width, maxY - height)
  return { x, y, width, height }
}

export function generateRandomPoint(
  maxX = AREA_SIZE,
  maxY = AREA_SIZE,
): Vector2 {
  const x = Math.floor(Math.random() * maxX)
  const y = Math.floor(Math.random() * maxY)
  return { x, y }
}

export function generateExpectedIntersecting(
  testData: { id: number; rect: Rect }[],
  queryRect: Rect,
): { id: number; rect: Rect }[] {
  return testData
    .filter((item) => {
      return (
        item.rect.x <= queryRect.x + queryRect.width &&
        item.rect.x + item.rect.width >= queryRect.x &&
        item.rect.y <= queryRect.y + queryRect.height &&
        item.rect.y + item.rect.height >= queryRect.y
      )
    })
    .sort((a, b) => a.id - b.id)
}

export function generateExpectedNearest(
  testData: { id: number; rect: Rect }[],
  queryPoint: Vector2,
  k: number,
): { id: number; rect: Rect }[] {
  return testData
    .map((item) => ({
      item,
      distance: rectQuadDistance(queryPoint, item.rect),
    }))
    .sort((a, b) => {
      const d = a.distance - b.distance
      return d === 0 ? a.item.id - b.item.id : d
    })
    .slice(0, k)
    .map((entry) => entry.item)
}
