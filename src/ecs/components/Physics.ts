import { Component } from '../Component'

/**
 * Physics component stores physical properties of an entity
 */
export class Physics implements Component {
  constructor(
    public radius: number,
    public mass: number
  ) {}
}
