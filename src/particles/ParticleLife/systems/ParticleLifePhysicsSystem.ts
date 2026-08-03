import { System } from '../../../ecs/System'
import { World } from '../../../ecs/World'
import { Query } from '../../../ecs/Query'
import { Transform } from '../../../ecs/components/Transform'
import { Velocity } from '../../../ecs/components/Velocity'
import { ForceAccumulator } from '../../../ecs/components/ForceAccumulator'
import { SocialForces } from '../components/SocialForces'
import { PHYSICS_TARGET_DT } from '../../../simulation/common'

/**
 * ParticleLifePhysicsSystem implements the simplified physics model used by ParticleLife.
 * Unlike proper Newtonian physics (F=ma), this system:
 * 1. Adds forces directly to velocity (assumes mass=1, no time scaling)
 * 2. Applies damping: v = (v + f) * (1 - damping)
 * 3. Updates position: p += v
 *
 * This matches the original ParticleLife behavior for compatibility.
 */
export class ParticleLifePhysicsSystem extends System {
  private query: Query<[Transform, Velocity, ForceAccumulator, SocialForces]>

  constructor(world: World) {
    super(world)
    this.query = new Query(world, Transform, Velocity, ForceAccumulator, SocialForces)
  }

  update(dt: number): void {
    // Invalidate query cache to pick up new entities
    this.query.invalidate()

    // Scale factor: ratio of actual dt to target dt (60 FPS)
    const scale = dt / PHYSICS_TARGET_DT

    for (const entity of this.query.entities()) {
      const [transform, velocity, forceAccum, socialForces] =
        this.query.getComponents(entity)

      // Apply forces scaled by dt
      velocity.velocity.x += forceAccum.force.x * scale
      velocity.velocity.y += forceAccum.force.y * scale

      // Apply damping scaled by dt (exponential for framerate independence)
      const dampingFactor = Math.pow(1.0 - socialForces.damping, scale)
      velocity.velocity.x *= dampingFactor
      velocity.velocity.y *= dampingFactor

      // Update position (velocity already accounts for scaled time)
      transform.position.x += velocity.velocity.x
      transform.position.y += velocity.velocity.y

      // Reset forces for next frame
      forceAccum.reset()
    }
  }
}
