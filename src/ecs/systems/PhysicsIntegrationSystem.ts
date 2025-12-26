import { System } from '../System'
import { World } from '../World'
import { Query } from '../Query'
import { Transform } from '../components/Transform'
import { Velocity } from '../components/Velocity'
import { ForceAccumulator } from '../components/ForceAccumulator'
import { Physics } from '../components/Physics'

/**
 * PhysicsIntegrationSystem applies forces to velocity and integrates velocity to position.
 * This implements a simple Euler integration: F = ma, v += a*dt, p += v*dt
 */
export class PhysicsIntegrationSystem extends System {
  private query: Query<[Transform, Velocity, ForceAccumulator, Physics]>

  constructor(world: World) {
    super(world)
    this.query = new Query(world, Transform, Velocity, ForceAccumulator, Physics)
  }

  update(dt: number): void {
    // Invalidate query cache to pick up new entities
    this.query.invalidate()

    // Convert dt from milliseconds to seconds for physics calculations
    const dtSec = dt / 1000

    for (const entity of this.query.entities()) {
      const [transform, velocity, forceAccumulator, physics] =
        this.query.getComponents(entity)

      // F = ma => a = F/m
      const ax = forceAccumulator.force.x / physics.mass
      const ay = forceAccumulator.force.y / physics.mass

      // Update velocity: v += a*dt
      velocity.velocity.x += ax * dtSec
      velocity.velocity.y += ay * dtSec

      // Update position: p += v*dt
      transform.position.x += velocity.velocity.x * dtSec
      transform.position.y += velocity.velocity.y * dtSec

      // Reset forces for next frame
      forceAccumulator.reset()
    }
  }
}
