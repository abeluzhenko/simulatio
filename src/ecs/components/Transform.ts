import { Component } from '../Component'
import { Vector2 } from '../../math/Vector2'

/**
 * Transform component stores the position of an entity in 2D space
 */
export class Transform implements Component {
  public position: Vector2

  constructor(x: number, y: number) {
    this.position = { x, y }
  }
}
