import { Component } from '../../../ecs/Component'

/**
 * ParticleKind identifies which faction/type a particle belongs to.
 * Different kinds have different social force rules (attraction/repulsion).
 */
export class ParticleKind implements Component {
  constructor(
    public kind: string,
    public color: number,
  ) {}
}
