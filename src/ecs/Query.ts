import { Component, ComponentConstructor } from './Component'
import { Entity } from './Entity'
import { World } from './World'

/**
 * Query matches entities that have all specified components.
 * Caches results for performance and invalidates when needed.
 */
export class Query<T extends Component[] = Component[]> {
  private cachedEntities: Set<Entity> | null = null
  private componentCtors: ComponentConstructor[]

  constructor(
    private world: World,
    ...componentCtors: { [K in keyof T]: ComponentConstructor<T[K]> }
  ) {
    this.componentCtors = componentCtors as ComponentConstructor[]
  }

  /**
   * Returns an iterator of entities that match the query
   */
  *entities(): IterableIterator<Entity> {
    if (this.cachedEntities === null) {
      this.buildCache()
    }

    yield* this.cachedEntities!.values()
  }

  /**
   * Gets the components for an entity (assumes entity matches query)
   */
  getComponents(entity: Entity): T {
    const components: Component[] = []
    for (const ctor of this.componentCtors) {
      const component = this.world.getComponent(entity, ctor)
      if (!component) {
        throw new Error(
          `Entity ${entity} missing component ${ctor.name} in query`,
        )
      }
      components.push(component)
    }
    return components as T
  }

  /**
   * Checks if an entity matches this query
   */
  matches(entity: Entity): boolean {
    for (const ctor of this.componentCtors) {
      if (!this.world.hasComponent(entity, ctor)) {
        return false
      }
    }
    return true
  }

  /**
   * Gets the count of matching entities
   */
  count(): number {
    if (this.cachedEntities === null) {
      this.buildCache()
    }
    return this.cachedEntities!.size
  }

  /**
   * Invalidates the cache, forcing rebuild on next access
   */
  invalidate(): void {
    this.cachedEntities = null
  }

  /**
   * Builds the cache by iterating all entities and checking matches
   */
  private buildCache(): void {
    this.cachedEntities = new Set()

    // Start with entities that have the first component
    if (this.componentCtors.length === 0) {
      return
    }

    const firstCtor = this.componentCtors[0]
    const candidateEntities = this.world.getEntitiesWithComponent(firstCtor)

    // Filter candidates by checking if they have all other components
    for (const entity of candidateEntities) {
      if (this.matches(entity)) {
        this.cachedEntities.add(entity)
      }
    }
  }
}
