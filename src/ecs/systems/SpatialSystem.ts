import { System } from '../System'
import { World } from '../World'
import { Entity } from '../Entity'
import { Query } from '../Query'
import { BoundingBox } from '../components/BoundingBox'
import { Storage, StorageItem, ItemId } from '../../storage/Storage'
import { Rect } from '../../math/Rect'
import { Vector2 } from '../../math/Vector2'

/**
 * Adapter class that makes ECS entities compatible with Storage interface
 */
class SpatialEntity implements StorageItem {
  constructor(
    public readonly entity: Entity,
    public readonly boundingBox: BoundingBox
  ) {}

  get id(): ItemId {
    return this.entity
  }

  get rect(): Rect {
    return this.boundingBox.rect
  }
}

/**
 * SpatialSystem wraps existing Storage implementations to provide
 * spatial indexing for ECS entities. This allows reuse of existing
 * QuadTree and R-tree implementations without modification.
 */
export class SpatialSystem extends System {
  private query: Query<[BoundingBox]>
  private spatialEntities: Map<Entity, SpatialEntity> = new Map()

  constructor(
    world: World,
    private storage: Storage<SpatialEntity>
  ) {
    super(world)
    this.query = new Query(world, BoundingBox)
  }

  init(): void {
    // Initialize with existing entities if any
    for (const entity of this.query.entities()) {
      const [bbox] = this.query.getComponents(entity)
      this.addEntity(entity, bbox)
    }
  }

  update(dt: number): void {
    // Invalidate query cache to pick up new entities
    this.query.invalidate()

    // Batch update all entities in storage
    for (const entity of this.query.entities()) {
      const [bbox] = this.query.getComponents(entity)

      let spatialEntity = this.spatialEntities.get(entity)
      if (!spatialEntity) {
        // New entity - add to storage
        this.addEntity(entity, bbox)
      } else {
        // Existing entity - update position
        this.storage.update(entity, bbox.rect)
      }
    }

    // Remove entities that no longer have BoundingBox
    const toRemove: Entity[] = []
    for (const [entity] of this.spatialEntities) {
      if (!this.world.hasComponent(entity, BoundingBox)) {
        toRemove.push(entity)
      }
    }
    for (const entity of toRemove) {
      this.removeEntity(entity)
    }
  }

  destroy(): void {
    // Remove all entities from storage
    for (const entity of this.spatialEntities.keys()) {
      this.storage.delete(entity)
    }
    this.spatialEntities.clear()
  }

  /**
   * Adds an entity to the spatial index
   */
  private addEntity(entity: Entity, bbox: BoundingBox): void {
    const spatialEntity = new SpatialEntity(entity, bbox)
    this.spatialEntities.set(entity, spatialEntity)
    this.storage.add(entity, spatialEntity)
  }

  /**
   * Removes an entity from the spatial index
   */
  removeEntity(entity: Entity): void {
    this.storage.delete(entity)
    this.spatialEntities.delete(entity)
  }

  /**
   * Query entities intersecting with a rectangle
   */
  *intersecting(rect: Rect): IterableIterator<Entity> {
    for (const spatialEntity of this.storage.intersecting(rect)) {
      yield spatialEntity.entity
    }
  }

  /**
   * Query nearest entities to a point
   */
  *nearest(point: Vector2, k: number): IterableIterator<Entity> {
    for (const spatialEntity of this.storage.nearest(point, k)) {
      yield spatialEntity.entity
    }
  }

  /**
   * Gets the underlying storage for debug visualization
   */
  getStorage(): Storage<SpatialEntity> {
    return this.storage
  }
}
