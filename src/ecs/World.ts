import { Component, ComponentConstructor } from './Component'
import { Entity } from './Entity'

/**
 * World manages entities and their components.
 * Provides entity lifecycle management and component queries.
 */
export class World {
  private nextEntityId: Entity = 1
  private entities: Set<Entity> = new Set()

  // Map of component type -> Map of entity -> component instance
  private componentsByType: Map<ComponentConstructor, Map<Entity, Component>> =
    new Map()

  // Deferred operations for safe mutation during iteration
  private pendingAddComponents: Array<{
    entity: Entity
    ctor: ComponentConstructor
    component: Component
  }> = []
  private pendingRemoveComponents: Array<{
    entity: Entity
    ctor: ComponentConstructor
  }> = []
  private pendingDestroyEntities: Set<Entity> = new Set()

  /**
   * Creates a new entity and returns its ID
   */
  createEntity(): Entity {
    const entity = this.nextEntityId++
    this.entities.add(entity)
    return entity
  }

  /**
   * Destroys an entity and all its components.
   * Deferred until flush() is called.
   */
  destroyEntity(entity: Entity): void {
    if (!this.entities.has(entity)) {
      return
    }
    this.pendingDestroyEntities.add(entity)
  }

  /**
   * Immediately destroys an entity (used internally after flush)
   */
  private destroyEntityImmediate(entity: Entity): void {
    if (!this.entities.has(entity)) {
      return
    }

    // Remove all components for this entity
    for (const [, componentsMap] of this.componentsByType) {
      componentsMap.delete(entity)
    }

    this.entities.delete(entity)
  }

  /**
   * Adds a component to an entity.
   * Deferred until flush() is called.
   */
  addComponent<T extends Component>(entity: Entity, component: T): void {
    if (!this.entities.has(entity)) {
      throw new Error(`Entity ${entity} does not exist`)
    }

    const ctor = component.constructor as ComponentConstructor<T>
    this.pendingAddComponents.push({ entity, ctor, component })
  }

  /**
   * Immediately adds a component (used internally after flush)
   */
  private addComponentImmediate<T extends Component>(
    entity: Entity,
    ctor: ComponentConstructor<T>,
    component: T,
  ): void {
    let componentsMap = this.componentsByType.get(ctor)
    if (!componentsMap) {
      componentsMap = new Map()
      this.componentsByType.set(ctor, componentsMap)
    }

    componentsMap.set(entity, component)
  }

  /**
   * Removes a component from an entity.
   * Deferred until flush() is called.
   */
  removeComponent<T extends Component>(
    entity: Entity,
    ctor: ComponentConstructor<T>,
  ): void {
    this.pendingRemoveComponents.push({ entity, ctor })
  }

  /**
   * Immediately removes a component (used internally after flush)
   */
  private removeComponentImmediate<T extends Component>(
    entity: Entity,
    ctor: ComponentConstructor<T>,
  ): void {
    const componentsMap = this.componentsByType.get(ctor)
    if (componentsMap) {
      componentsMap.delete(entity)
    }
  }

  /**
   * Gets a component from an entity
   */
  getComponent<T extends Component>(
    entity: Entity,
    ctor: ComponentConstructor<T>,
  ): T | undefined {
    const componentsMap = this.componentsByType.get(ctor)
    return componentsMap?.get(entity) as T | undefined
  }

  /**
   * Checks if an entity has a component
   */
  hasComponent<T extends Component>(
    entity: Entity,
    ctor: ComponentConstructor<T>,
  ): boolean {
    const componentsMap = this.componentsByType.get(ctor)
    return componentsMap?.has(entity) ?? false
  }

  /**
   * Gets all entities that have a specific component
   */
  getEntitiesWithComponent<T extends Component>(
    ctor: ComponentConstructor<T>,
  ): IterableIterator<Entity> {
    const componentsMap = this.componentsByType.get(ctor)
    return componentsMap?.keys() ?? [].values()
  }

  /**
   * Gets all entities in the world
   */
  getAllEntities(): IterableIterator<Entity> {
    return this.entities.values()
  }

  /**
   * Gets the total number of entities
   */
  getEntityCount(): number {
    return this.entities.size
  }

  /**
   * Processes all pending entity and component operations.
   * Should be called once per frame before systems run.
   */
  flush(): void {
    // Process pending component additions
    for (const { entity, ctor, component } of this.pendingAddComponents) {
      // Check if entity wasn't destroyed while pending
      if (this.entities.has(entity)) {
        this.addComponentImmediate(entity, ctor, component)
      }
    }
    this.pendingAddComponents.length = 0

    // Process pending component removals
    for (const { entity, ctor } of this.pendingRemoveComponents) {
      if (this.entities.has(entity)) {
        this.removeComponentImmediate(entity, ctor)
      }
    }
    this.pendingRemoveComponents.length = 0

    // Process pending entity destructions
    for (const entity of this.pendingDestroyEntities) {
      this.destroyEntityImmediate(entity)
    }
    this.pendingDestroyEntities.clear()
  }

  /**
   * Clears all entities and components from the world
   */
  clear(): void {
    this.entities.clear()
    this.componentsByType.clear()
    this.pendingAddComponents.length = 0
    this.pendingRemoveComponents.length = 0
    this.pendingDestroyEntities.clear()
    this.nextEntityId = 1
  }
}
