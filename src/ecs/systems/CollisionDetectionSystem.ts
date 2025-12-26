import { System } from '../System'
import { World } from '../World'
import { Query } from '../Query'
import { Component } from '../Component'
import { BoundingBox } from '../components/BoundingBox'
import { Physics } from '../components/Physics'
import { Transform } from '../components/Transform'
import { SpatialSystem } from './SpatialSystem'
import { quadDistance } from '../../math/Vector2'

/**
 * Collision component marks entities involved in collisions this frame.
 * This is added by CollisionDetectionSystem and consumed by CollisionResponseSystem.
 */
export class Collision implements Component {
  constructor(public collidedWith: Set<number>) {}
}

/**
 * CollisionDetectionSystem finds intersecting entities using the spatial system.
 * It performs circle-circle collision detection and adds Collision components
 * to entities that are overlapping.
 */
export class CollisionDetectionSystem extends System {
  private query: Query<[Transform, Physics, BoundingBox]>

  constructor(
    world: World,
    private spatialSystem: SpatialSystem,
  ) {
    super(world)
    this.query = new Query(world, Transform, Physics, BoundingBox)
  }

  update(dt: number): void {
    // Invalidate query cache to pick up new entities
    this.query.invalidate()

    // Clear previous frame's collision components
    for (const entity of this.query.entities()) {
      if (this.world.hasComponent(entity, Collision)) {
        this.world.removeComponent(entity, Collision)
      }
    }
    this.world.flush()

    // Detect new collisions
    for (const entity of this.query.entities()) {
      const [transform, physics, bbox] = this.query.getComponents(entity)

      const collidedWith = new Set<number>()

      // Query nearby entities using spatial index
      for (const otherEntity of this.spatialSystem.intersecting(bbox.rect)) {
        if (otherEntity === entity) {
          continue
        }

        // Get other entity's components
        const otherTransform = this.world.getComponent(otherEntity, Transform)
        const otherPhysics = this.world.getComponent(otherEntity, Physics)

        if (!otherTransform || !otherPhysics) {
          continue
        }

        // Circle-circle collision test
        const distSq = quadDistance(transform.position, otherTransform.position)
        const radiusSum = physics.radius + otherPhysics.radius
        const radiusSumSq = radiusSum * radiusSum

        if (distSq < radiusSumSq) {
          collidedWith.add(otherEntity)
        }
      }

      // Add Collision component if entity is colliding with others
      if (collidedWith.size > 0) {
        this.world.addComponent(entity, new Collision(collidedWith))
      }
    }

    this.world.flush()
  }
}
