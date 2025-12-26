import { World } from '../ecs/World'
import { Entity } from '../ecs/Entity'
import { Feature } from '../ecs/Feature'
import { FeatureManager } from '../ecs/FeatureManager'
import { SpatialSystem } from '../ecs/systems/SpatialSystem'
import { Storage } from '../storage/Storage'
import { Rect } from '../math/Rect'

type ECSSimulationConfig = {
  maxFPS: number
  speed: number
  worldBounds: Rect
  storage: Storage<any>
  feature: Feature
  featureContext: any
}

/**
 * ECSSimulation manages the ECS world, feature, and system execution.
 * This replaces the OOP Simulation class with an ECS-based architecture.
 */
export class ECSSimulation {
  private world: World
  private featureManager: FeatureManager
  private spatialSystem: SpatialSystem
  private feature: Feature
  private featureContext: any
  private worldBounds: Rect

  private deltaTime = 0
  private frameTime: number
  private population = 0
  private entities: Entity[] = []

  constructor(config: ECSSimulationConfig) {
    this.worldBounds = config.worldBounds
    this.world = new World()
    this.featureManager = new FeatureManager(this.world)

    // Create and register spatial system (core infrastructure)
    this.spatialSystem = new SpatialSystem(this.world, config.storage)
    this.featureManager.registerSystem({
      system: this.spatialSystem,
      phase: 'early',
    })

    // Store feature and context for entity creation
    this.feature = config.feature
    this.featureContext = {
      ...config.featureContext,
      spatialSystem: this.spatialSystem,
      worldBounds: config.worldBounds,
    }

    // Register feature (adds feature systems to manager)
    this.featureManager.registerFeature(this.feature, this.featureContext)

    // Set initial speed
    this.setSpeed(config.speed, config.maxFPS)
  }

  /**
   * Sets simulation speed multiplier
   */
  setSpeed(speed: number, maxFPS: number): void {
    this.frameTime = (1000 / maxFPS) * (1 / Math.min(1, Math.max(0.001, speed)))
  }

  /**
   * Sets target population, creating or destroying entities as needed
   */
  setPopulation(population: number): void {
    if (population < this.population) {
      this.destroyEntities(this.population - population)
    } else if (population > this.population) {
      this.createEntities(population - this.population)
    }

    this.population = population
  }

  /**
   * Starts simulation with initial population
   */
  start(population: number): void {
    if (this.population > 0) {
      throw new Error('Starting simulation while the population is not 0')
    }
    this.setPopulation(population)
  }

  /**
   * Stops simulation and destroys all entities
   */
  stop(): void {
    this.destroyEntities(this.population)
  }

  /**
   * Updates simulation by one frame (if enough time has elapsed)
   */
  tick(dt: number): void {
    this.deltaTime += dt
    if (this.deltaTime < this.frameTime) {
      return
    }

    // Flush any pending entity/component operations
    this.world.flush()

    // Update all systems via feature manager
    this.featureManager.update(dt)

    // Flush again after system updates
    this.world.flush()

    this.deltaTime = 0
  }

  /**
   * Gets the ECS world (for debugging/inspection)
   */
  getWorld(): World {
    return this.world
  }

  /**
   * Gets the spatial system (for rendering/debugging)
   */
  getSpatialSystem(): SpatialSystem {
    return this.spatialSystem
  }

  /**
   * Gets the current population count
   */
  getPopulation(): number {
    return this.population
  }

  /**
   * Gets all entity IDs
   */
  getEntities(): Entity[] {
    return this.entities
  }

  /**
   * Destroys the simulation and cleans up all resources
   */
  destroy(): void {
    this.featureManager.destroy()
    this.world.clear()
    this.entities = []
    this.population = 0
  }

  /**
   * Creates N entities using the feature's factory
   */
  private createEntities(n: number): void {
    for (let i = 0; i < n; i++) {
      const entity = this.feature.createEntity(this.world, this.featureContext)
      this.entities.push(entity)
    }
    this.world.flush()
  }

  /**
   * Destroys the last N entities
   */
  private destroyEntities(n: number): void {
    for (let i = 0; i < n; i++) {
      const entity = this.entities.pop()
      if (entity !== undefined) {
        this.world.destroyEntity(entity)
      }
    }
    this.world.flush()
  }
}
