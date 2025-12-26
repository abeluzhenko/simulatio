import { Component } from '../../../ecs/Component'

/**
 * SocialForces stores the attraction/repulsion rules between different particle kinds.
 * This is shared configuration data used by the SocialForceSystem.
 */
export class SocialForces implements Component {
  constructor(
    public forceRadius: number,
    public retractionForce: number,
    public damping: number,
    public rules: Record<string, Record<string, number>>,
  ) {}
}
