import { Entity } from './Entity'
import { System } from './System'
import { World } from './World'

/**
 * Execution phase for systems (coarse-grained ordering)
 */
export type SystemPhase = 'early' | 'physics' | 'late'

/**
 * System registration with dependency constraints
 */
export interface SystemRegistration {
  /** The system instance to register */
  system: System

  /** Names of systems this must run before (optional) */
  before?: string[]

  /** Names of systems this must run after (optional) */
  after?: string[]

  /** Execution phase for coarse-grained ordering (optional) */
  phase?: SystemPhase
}

/**
 * Feature is a pluggable particle system implementation.
 * Features provide their own components, systems, and entity factories.
 */
export abstract class Feature {
  /** Unique name for this feature */
  abstract readonly name: string

  /**
   * Returns the systems this feature provides
   * @param world The ECS world
   * @param context Additional context (e.g., spatial system, world size)
   */
  abstract getSystems(world: World, context: unknown): SystemRegistration[]

  /**
   * Creates an entity for this feature with appropriate components
   * @param world The ECS world
   * @param options Creation options (e.g., world size, position)
   */
  abstract createEntity(world: World, options: unknown): Entity

  /**
   * Optional initialization hook
   */
  init?(world: World): void

  /**
   * Optional cleanup hook
   */
  destroy?(world: World): void
}
