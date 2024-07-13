import { rectQuadDistance } from '../math/Rect'
import { Vector2 } from '../math/Vector2'
import { StorageItem } from './Storage'

export function getNearestQuadCompareFn<I extends StorageItem>(point: Vector2) {
  return (a: I, b: I) => {
    const d = rectQuadDistance(point, a.rect) - rectQuadDistance(point, b.rect)
    // @todo: use quadDistance and only then fallback to id
    return d === 0 ? a.id - b.id : d
  }
}
