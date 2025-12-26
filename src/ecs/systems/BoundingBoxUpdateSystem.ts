import { System } from '../System'
import { World } from '../World'
import { Query } from '../Query'
import { Transform } from '../components/Transform'
import { BoundingBox } from '../components/BoundingBox'
import { Physics } from '../components/Physics'

/**
 * BoundingBoxUpdateSystem synchronizes BoundingBox rects with entity positions.
 * This must run after physics integration but before spatial queries.
 */
export class BoundingBoxUpdateSystem extends System {
  private query: Query<[Transform, BoundingBox, Physics]>

  constructor(world: World) {
    super(world)
    this.query = new Query(world, Transform, BoundingBox, Physics)
  }

  update(dt: number): void {
    // Invalidate query cache to pick up new entities
    this.query.invalidate()

    for (const entity of this.query.entities()) {
      const [transform, bbox, physics] = this.query.getComponents(entity)

      // Update bounding box to center on entity position
      const diameter = physics.radius * 2
      bbox.rect.x = transform.position.x - physics.radius
      bbox.rect.y = transform.position.y - physics.radius
      bbox.rect.width = diameter
      bbox.rect.height = diameter

      // Update forceRect if it exists (used by ParticleLife for extended force range)
      if (bbox.forceRect) {
        // forceRect dimensions are determined by the feature system
        // Here we just center it on the entity position
        const halfWidth = bbox.forceRect.width / 2
        const halfHeight = bbox.forceRect.height / 2
        bbox.forceRect.x = transform.position.x - halfWidth
        bbox.forceRect.y = transform.position.y - halfHeight
      }
    }
  }
}
