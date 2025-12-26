import { System } from '../System'
import { World } from '../World'
import { Query } from '../Query'
import { Transform } from '../components/Transform'
import { Velocity } from '../components/Velocity'
import { Physics } from '../components/Physics'
import { Rect } from '../../math/Rect'

/**
 * BoundaryBounceSystem bounces entities off world boundaries.
 * When an entity hits an edge, its velocity is reversed (with optional damping).
 */
export class BoundaryBounceSystem extends System {
  private query: Query<[Transform, Velocity, Physics]>

  constructor(
    world: World,
    private worldBounds: Rect,
    private restitution: number = 1.0, // 1.0 = perfectly elastic, <1.0 = energy loss
  ) {
    super(world)
    this.query = new Query(world, Transform, Velocity, Physics)
  }

  update(dt: number): void {
    // Invalidate query cache to pick up new entities
    this.query.invalidate()

    const { x: minX, y: minY, width, height } = this.worldBounds
    const maxX = minX + width
    const maxY = minY + height

    for (const entity of this.query.entities()) {
      const [transform, velocity, physics] = this.query.getComponents(entity)

      const radius = physics.radius

      // Bounce off left/right walls
      if (transform.position.x - radius < minX) {
        transform.position.x = minX + radius
        velocity.velocity.x = Math.abs(velocity.velocity.x) * this.restitution
      } else if (transform.position.x + radius > maxX) {
        transform.position.x = maxX - radius
        velocity.velocity.x = -Math.abs(velocity.velocity.x) * this.restitution
      }

      // Bounce off top/bottom walls
      if (transform.position.y - radius < minY) {
        transform.position.y = minY + radius
        velocity.velocity.y = Math.abs(velocity.velocity.y) * this.restitution
      } else if (transform.position.y + radius > maxY) {
        transform.position.y = maxY - radius
        velocity.velocity.y = -Math.abs(velocity.velocity.y) * this.restitution
      }
    }
  }

  /**
   * Updates the world bounds (e.g., when window is resized)
   */
  setWorldBounds(bounds: Rect): void {
    this.worldBounds = bounds
  }

  /**
   * Updates the restitution coefficient
   */
  setRestitution(restitution: number): void {
    this.restitution = restitution
  }
}
