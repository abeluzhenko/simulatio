import { Component } from '../Component'
import { Rect } from '../../math/Rect'

/**
 * BoundingBox component stores the spatial bounds of an entity for collision detection
 * and spatial queries
 */
export class BoundingBox implements Component {
  public rect: Rect
  public forceRect?: Rect

  constructor(x: number, y: number, width: number, height: number) {
    this.rect = { x, y, width, height }
  }
}
