import { Component } from '../../../ecs/Component'
import { Vector2 } from '../../../math/Vector2'

/**
 * GravityWell attracts the entity toward a specific point in space.
 * Used in ParticleLife to create a gentle pull toward the world center.
 */
export class GravityWell implements Component {
  constructor(
    public center: Vector2,
    public force: number,
  ) {}
}
