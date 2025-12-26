import { System } from '../System'
import { World } from '../World'
import { Query } from '../Query'
import { Transform } from '../components/Transform'
import { Velocity } from '../components/Velocity'
import { Physics } from '../components/Physics'
import { Collision } from './CollisionDetectionSystem'
import { distance, normalize, subtract } from '../../math/Vector2'

/**
 * CollisionResponseSystem handles elastic collision physics between entities.
 * It resolves collisions by separating overlapping entities and updating velocities
 * based on conservation of momentum and energy.
 */
export class CollisionResponseSystem extends System {
  private query: Query<[Transform, Velocity, Physics, Collision]>

  constructor(
    world: World,
    private restitution: number = 1.0, // 1.0 = perfectly elastic, <1.0 = energy loss
  ) {
    super(world)
    this.query = new Query(world, Transform, Velocity, Physics, Collision)
  }

  update(dt: number): void {
    // Invalidate query cache to pick up new entities
    this.query.invalidate()

    const processed = new Set<string>()

    for (const entity of this.query.entities()) {
      const [transform, velocity, physics, collision] =
        this.query.getComponents(entity)

      for (const otherEntity of collision.collidedWith) {
        // Skip if we already processed this collision pair
        const pairKey =
          entity < otherEntity
            ? `${entity}-${otherEntity}`
            : `${otherEntity}-${entity}`
        if (processed.has(pairKey)) {
          continue
        }
        processed.add(pairKey)

        // Get other entity's components
        const otherTransform = this.world.getComponent(otherEntity, Transform)
        const otherVelocity = this.world.getComponent(otherEntity, Velocity)
        const otherPhysics = this.world.getComponent(otherEntity, Physics)

        if (!otherTransform || !otherVelocity || !otherPhysics) {
          continue
        }

        // Separate overlapping entities
        const dist = distance(transform.position, otherTransform.position)
        const radiusSum = physics.radius + otherPhysics.radius

        if (dist < radiusSum && dist > 0) {
          const overlap = radiusSum - dist
          const separation = normalize(
            subtract(transform.position, otherTransform.position),
          )

          // Separate entities proportional to their masses
          const totalMass = physics.mass + otherPhysics.mass
          const ratio1 = otherPhysics.mass / totalMass
          const ratio2 = physics.mass / totalMass

          transform.position.x += separation.x * overlap * ratio1
          transform.position.y += separation.y * overlap * ratio1

          otherTransform.position.x -= separation.x * overlap * ratio2
          otherTransform.position.y -= separation.y * overlap * ratio2
        }

        // Elastic collision response (conservation of momentum and energy)
        // Reference: https://en.wikipedia.org/wiki/Elastic_collision#Two-dimensional_collision_with_two_moving_objects
        const dx = otherTransform.position.x - transform.position.x
        const dy = otherTransform.position.y - transform.position.y
        const distSq = dx * dx + dy * dy

        if (distSq === 0) {
          continue
        }

        const dvx = velocity.velocity.x - otherVelocity.velocity.x
        const dvy = velocity.velocity.y - otherVelocity.velocity.y

        const dvDotDist = dvx * dx + dvy * dy

        // Only resolve if entities are moving towards each other
        if (dvDotDist > 0) {
          continue
        }

        const m1 = physics.mass
        const m2 = otherPhysics.mass
        const factor = (2 * dvDotDist) / ((m1 + m2) * distSq)

        // Update velocities with restitution
        velocity.velocity.x -= m2 * factor * dx * this.restitution
        velocity.velocity.y -= m2 * factor * dy * this.restitution

        otherVelocity.velocity.x += m1 * factor * dx * this.restitution
        otherVelocity.velocity.y += m1 * factor * dy * this.restitution
      }
    }
  }

  /**
   * Updates the restitution coefficient
   */
  setRestitution(restitution: number): void {
    this.restitution = restitution
  }
}
