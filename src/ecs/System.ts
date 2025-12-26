import { World } from './World'

/**
 * Base class for all systems.
 * Systems contain logic that operates on entities with specific components.
 */
export abstract class System {
  protected world: World

  constructor(world: World) {
    this.world = world
  }

  /**
   * Initialize the system (called once when system is added)
   */
  init(): void {}

  /**
   * Update the system (called every frame)
   * @param dt Delta time in milliseconds
   */
  abstract update(dt: number): void

  /**
   * Clean up the system (called when system is removed)
   */
  destroy(): void {}

  /**
   * Gets the system's name (used for dependency resolution)
   */
  getName(): string {
    return this.constructor.name
  }
}

/**
 * Coordinates execution of multiple systems
 */
export class SystemCoordinator {
  private systems: System[] = []

  /**
   * Adds a system to the coordinator
   */
  addSystem(system: System): void {
    this.systems.push(system)
    system.init()
  }

  /**
   * Removes a system from the coordinator
   */
  removeSystem(system: System): void {
    const index = this.systems.indexOf(system)
    if (index !== -1) {
      system.destroy()
      this.systems.splice(index, 1)
    }
  }

  /**
   * Updates all systems in order
   */
  update(dt: number): void {
    for (const system of this.systems) {
      system.update(dt)
    }
  }

  /**
   * Destroys all systems
   */
  destroy(): void {
    for (const system of this.systems) {
      system.destroy()
    }
    this.systems.length = 0
  }

  /**
   * Gets all systems
   */
  getSystems(): readonly System[] {
    return this.systems
  }
}
