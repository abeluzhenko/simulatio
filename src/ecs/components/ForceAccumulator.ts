import { Component } from '../Component'
import { Vector2 } from '../../math/Vector2'

/**
 * ForceAccumulator component accumulates forces applied to an entity.
 * Forces are reset each frame and accumulated by various systems.
 */
export class ForceAccumulator implements Component {
  public force: Vector2

  constructor() {
    this.force = { x: 0, y: 0 }
  }

  /**
   * Resets accumulated forces to zero
   */
  reset(): void {
    this.force.x = 0
    this.force.y = 0
  }

  /**
   * Adds a force to the accumulator
   */
  addForce(fx: number, fy: number): void {
    this.force.x += fx
    this.force.y += fy
  }
}
