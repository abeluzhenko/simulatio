import { World } from '../ecs/World'
import { Entity } from '../ecs/Entity'
import { BoundingBox } from '../ecs/components/BoundingBox'
import { Visual } from '../ecs/components/Visual'
import { SpatialSystem } from '../ecs/systems/SpatialSystem'
import { RenderItem } from './Render'
import { Storage, ItemId } from '../storage/Storage'
import { Rect } from '../math/Rect'
import { Vector2 } from '../math/Vector2'

/**
 * ECSRenderAdapter converts ECS entities into RenderItems for the existing renderers.
 * It wraps the SpatialSystem and provides a Storage-like interface that yields RenderItems.
 */
export class ECSRenderAdapter implements Storage<RenderItem> {
  constructor(
    private world: World,
    private spatialSystem: SpatialSystem,
  ) {}

  /**
   * Converts an entity to a RenderItem
   */
  private entityToRenderItem(entity: Entity): RenderItem | undefined {
    const bbox = this.world.getComponent(entity, BoundingBox)
    const visual = this.world.getComponent(entity, Visual)

    if (!bbox || !visual) {
      return undefined
    }

    return {
      id: entity,
      rect: bbox.rect,
      graphics: visual.graphics,
    }
  }

  // Storage interface implementation (only iterator is used by renderers)

  *[Symbol.iterator](): IterableIterator<RenderItem> {
    // Iterate all entities in the spatial system
    const storage = this.spatialSystem.getStorage()
    for (const spatialEntity of storage) {
      const renderItem = this.entityToRenderItem(spatialEntity.entity)
      if (renderItem) {
        yield renderItem
      }
    }
  }

  // The following methods are not used by renderers, but required by Storage interface

  add(): void {
    throw new Error('ECSRenderAdapter.add() is not implemented')
  }

  update(): void {
    throw new Error('ECSRenderAdapter.update() is not implemented')
  }

  delete(): void {
    throw new Error('ECSRenderAdapter.delete() is not implemented')
  }

  get(id: ItemId): RenderItem | undefined {
    const renderItem = this.entityToRenderItem(id as Entity)
    return renderItem ?? undefined
  }

  *intersecting(rect: Rect): IterableIterator<RenderItem> {
    for (const entity of this.spatialSystem.intersecting(rect)) {
      const renderItem = this.entityToRenderItem(entity)
      if (renderItem) {
        yield renderItem
      }
    }
  }

  *nearest(point: Vector2, k: number): IterableIterator<RenderItem> {
    for (const entity of this.spatialSystem.nearest(point, k)) {
      const renderItem = this.entityToRenderItem(entity)
      if (renderItem) {
        yield renderItem
      }
    }
  }

  clear(): void {
    throw new Error('ECSRenderAdapter.clear() is not implemented')
  }
}
