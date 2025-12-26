import { Feature, SystemRegistration } from '../../ecs/Feature'
import { World } from '../../ecs/World'
import { Entity } from '../../ecs/Entity'
import { Transform } from '../../ecs/components/Transform'
import { Velocity } from '../../ecs/components/Velocity'
import { Physics } from '../../ecs/components/Physics'
import { BoundingBox } from '../../ecs/components/BoundingBox'
import { Visual } from '../../ecs/components/Visual'
import { ForceAccumulator } from '../../ecs/components/ForceAccumulator'
import { ParticleKind } from './components/ParticleKind'
import { SocialForces } from './components/SocialForces'
import { GravityWell } from './components/GravityWell'
import { SocialForceSystem } from './systems/SocialForceSystem'
import { ParticleLifePhysicsSystem } from './systems/ParticleLifePhysicsSystem'
import { BoundaryWrapSystem } from '../../ecs/systems/BoundaryWrapSystem'
import { BoundingBoxUpdateSystem } from '../../ecs/systems/BoundingBoxUpdateSystem'
import { VisualUpdateSystem } from '../../ecs/systems/VisualUpdateSystem'
import { SpatialSystem } from '../../ecs/systems/SpatialSystem'
import { Random } from '../../math/Random'
import { Config, defaultConfig } from './config'
import { Rect } from '../../math/Rect'

export interface ParticleLifeContext {
  spatialSystem: SpatialSystem
  worldBounds: Rect
  config: Config
}

export interface ParticleLifeEntityOptions {
  worldBounds: Rect
  config: Config
}

/**
 * ParticleLifeFeature implements the artificial life simulation with social forces.
 * Entities attract/repel each other based on their kinds, creating emergent patterns.
 */
export class ParticleLifeFeature extends Feature {
  readonly name = 'ParticleLife'

  getSystems(
    world: World,
    context: ParticleLifeContext,
  ): SystemRegistration[] {
    const { spatialSystem, worldBounds, config } = context

    return [
      // 1. SocialForceSystem calculates forces based on neighbors
      {
        system: new SocialForceSystem(world, spatialSystem),
        after: ['SpatialSystem'], // Needs updated spatial index
        phase: 'physics',
      },

      // 2. ParticleLifePhysicsSystem applies forces with damping and updates position
      {
        system: new ParticleLifePhysicsSystem(world),
        after: ['SocialForceSystem'], // Needs accumulated forces
        phase: 'physics',
      },

      // 3. BoundaryWrapSystem wraps entities at world edges
      {
        system: new BoundaryWrapSystem(world, worldBounds),
        after: ['ParticleLifePhysicsSystem'], // Needs updated positions
        phase: 'physics',
      },

      // 4. BoundingBoxUpdateSystem syncs bounding boxes with positions
      {
        system: new BoundingBoxUpdateSystem(world),
        after: ['BoundaryWrapSystem'], // Needs final positions
        phase: 'late',
      },

      // 5. VisualUpdateSystem syncs graphics with components
      {
        system: new VisualUpdateSystem(world),
        after: ['BoundingBoxUpdateSystem'], // Needs updated positions
        phase: 'late',
      },
    ]
  }

  createEntity(world: World, options: ParticleLifeEntityOptions): Entity {
    const { worldBounds, config } = options

    // Create entity
    const entity = world.createEntity()

    // Randomly select a kind
    const kinds = Object.keys(config.rules)
    const kind = kinds[Math.floor(Random.next() * kinds.length)]
    const kindRules = config.rules[kind]
    const color = kindRules?.color ?? 0xffffffff

    // Random position
    const x = Random.next() * worldBounds.width
    const y = Random.next() * worldBounds.height

    // Random radius
    const radius = Math.max(
      config.minRadius,
      Random.next() * config.maxRadius,
    )

    // Add core components
    world.addComponent(entity, new Transform(x, y))
    world.addComponent(entity, new Velocity(0, 0))
    world.addComponent(entity, new Physics(radius, 1.0)) // mass = 1

    // BoundingBox with extended forceRect for spatial queries
    const bbox = new BoundingBox(
      x - radius,
      y - radius,
      radius * 2,
      radius * 2,
    )
    bbox.forceRect = {
      x: x - config.forceRadius,
      y: y - config.forceRadius,
      width: config.forceRadius * 2,
      height: config.forceRadius * 2,
    }
    world.addComponent(entity, bbox)

    world.addComponent(entity, new ForceAccumulator())

    // Visual component
    const graphics = [
      {
        type: 'circle' as const,
        x,
        y,
        radius,
        color,
        strokeWidth: 0,
        strokeColor: 0,
        visible: true,
      },
    ]
    world.addComponent(entity, new Visual(graphics))

    // Feature-specific components
    world.addComponent(entity, new ParticleKind(kind, color))
    world.addComponent(
      entity,
      new SocialForces(
        config.forceRadius,
        config.retractionForce,
        config.damping,
        config.rules,
      ),
    )
    world.addComponent(
      entity,
      new GravityWell(
        { x: worldBounds.width / 2, y: worldBounds.height / 2 },
        config.gravityForce,
      ),
    )

    return entity
  }
}
