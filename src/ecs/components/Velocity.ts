import { Component } from '../Component'
import { Vector2 } from '../../math/Vector2'

/**
 * Velocity component stores the velocity (movement speed and direction) of an entity
 */
export class Velocity implements Component {
  public velocity: Vector2

  constructor(vx: number, vy: number) {
    this.velocity = { x: vx, y: vy }
  }
}
