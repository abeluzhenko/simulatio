import { System } from '../System'
import { World } from '../World'
import { Query } from '../Query'
import { Transform } from '../components/Transform'
import { Rect } from '../../math/Rect'

/**
 * BoundaryWrapSystem wraps entities that go beyond world boundaries.
 * When an entity exits one edge, it appears on the opposite edge (toroidal topology).
 */
export class BoundaryWrapSystem extends System {
  private query: Query<[Transform]>

  constructor(
    world: World,
    private worldBounds: Rect,
  ) {
    super(world)
    this.query = new Query(world, Transform)
  }

  update(dt: number): void {
    // Invalidate query cache to pick up new entities
    this.query.invalidate()

    const { x: minX, y: minY, width, height } = this.worldBounds
    const maxX = minX + width
    const maxY = minY + height

    for (const entity of this.query.entities()) {
      const [transform] = this.query.getComponents(entity)

      // Wrap horizontally
      if (transform.position.x < minX) {
        transform.position.x = maxX - (minX - transform.position.x)
      } else if (transform.position.x > maxX) {
        transform.position.x = minX + (transform.position.x - maxX)
      }

      // Wrap vertically
      if (transform.position.y < minY) {
        transform.position.y = maxY - (minY - transform.position.y)
      } else if (transform.position.y > maxY) {
        transform.position.y = minY + (transform.position.y - maxY)
      }
    }
  }

  /**
   * Updates the world bounds (e.g., when window is resized)
   */
  setWorldBounds(bounds: Rect): void {
    this.worldBounds = bounds
  }
}
