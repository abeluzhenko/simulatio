import { Component } from '../Component'
import { Graphics } from '../../render/Graphics'

/**
 * Visual component stores the graphics data for rendering an entity
 */
export class Visual implements Component {
  constructor(public graphics: Graphics[]) {}
}
