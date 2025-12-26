import { System } from '../../../ecs/System'
import { World } from '../../../ecs/World'
import { Query } from '../../../ecs/Query'
import { Transform } from '../../../ecs/components/Transform'
import { Physics } from '../../../ecs/components/Physics'
import { ForceAccumulator } from '../../../ecs/components/ForceAccumulator'
import { BoundingBox } from '../../../ecs/components/BoundingBox'
import { ParticleKind } from '../components/ParticleKind'
import { SocialForces } from '../components/SocialForces'
import { GravityWell } from '../components/GravityWell'
import { SpatialSystem } from '../../../ecs/systems/SpatialSystem'
import { distance } from '../../../math/Vector2'

/**
 * SocialForceSystem implements the ParticleLife force calculations.
 * It calculates three types of forces:
 * 1. Retraction forces (collision avoidance) - short range repulsion
 * 2. Social forces (attraction/repulsion based on particle kinds) - medium range
 * 3. Gravity forces (attraction to world center) - long range
 */
export class SocialForceSystem extends System {
  private query: Query<
    [
      Transform,
      Physics,
      ForceAccumulator,
      BoundingBox,
      ParticleKind,
      SocialForces,
      GravityWell,
    ]
  >

  constructor(
    world: World,
    private spatialSystem: SpatialSystem,
  ) {
    super(world)
    this.query = new Query(
      world,
      Transform,
      Physics,
      ForceAccumulator,
      BoundingBox,
      ParticleKind,
      SocialForces,
      GravityWell,
    )
  }

  update(dt: number): void {
    // Invalidate query cache to pick up new entities
    this.query.invalidate()

    for (const entity of this.query.entities()) {
      const [transform, physics, forceAccum, bbox, kind, socialForces, gravity] =
        this.query.getComponents(entity)

      let fx = 0
      let fy = 0

      // Query nearby entities using spatial index with extended forceRect
      for (const otherEntity of this.spatialSystem.intersecting(
        bbox.forceRect!,
      )) {
        if (otherEntity === entity) {
          continue
        }

        // Get other entity's components
        const otherTransform = this.world.getComponent(otherEntity, Transform)
        const otherPhysics = this.world.getComponent(otherEntity, Physics)
        const otherKind = this.world.getComponent(otherEntity, ParticleKind)

        if (!otherTransform || !otherPhysics || !otherKind) {
          continue
        }

        const d = distance(transform.position, otherTransform.position)
        const dx = otherTransform.position.x - transform.position.x
        const dy = otherTransform.position.y - transform.position.y

        // 1. Retraction force (collision avoidance)
        const collisionDistance = physics.radius + otherPhysics.radius
        if (d > 0 && d <= collisionDistance) {
          const f = (1 - d / collisionDistance) * socialForces.retractionForce

          fx -= f * dx
          fy -= f * dy
        }

        // 2. Social force (attraction/repulsion based on kinds)
        const socialForceValue =
          socialForces.rules[kind.kind]?.[otherKind.kind] ?? 0
        if (
          socialForceValue !== 0 &&
          d > collisionDistance &&
          d <= socialForces.forceRadius
        ) {
          const f = (socialForceValue * 1) / d

          fx += f * dx
          fy += f * dy
        }
      }

      // 3. Gravity force (attraction to center)
      const gd = distance(transform.position, gravity.center)
      if (gd > 0) {
        fx += ((gravity.center.x - transform.position.x) / gd) * gravity.force
        fy += ((gravity.center.y - transform.position.y) / gd) * gravity.force
      }

      // Accumulate forces
      forceAccum.addForce(fx, fy)
    }
  }
}
