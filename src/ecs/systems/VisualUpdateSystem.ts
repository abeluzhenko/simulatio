import { System } from '../System'
import { World } from '../World'
import { Query } from '../Query'
import { Transform } from '../components/Transform'
import { Visual } from '../components/Visual'
import { Physics } from '../components/Physics'

/**
 * VisualUpdateSystem synchronizes graphics primitives with entity state.
 * Updates positions, colors, and other visual properties based on components.
 */
export class VisualUpdateSystem extends System {
  private query: Query<[Transform, Visual, Physics]>

  constructor(world: World) {
    super(world)
    this.query = new Query(world, Transform, Visual, Physics)
  }

  update(dt: number): void {
    // Invalidate query cache to pick up new entities
    this.query.invalidate()

    for (const entity of this.query.entities()) {
      const [transform, visual, physics] = this.query.getComponents(entity)

      // Update graphics positions and sizes based on current state
      for (const graphic of visual.graphics) {
        if (!graphic.visible) {
          continue
        }

        switch (graphic.type) {
          case 'circle':
            graphic.x = transform.position.x
            graphic.y = transform.position.y
            graphic.radius = physics.radius
            break

          case 'rectangle':
            // Center the rectangle on the entity position
            graphic.x = transform.position.x - graphic.width / 2
            graphic.y = transform.position.y - graphic.height / 2
            break

          case 'line':
            // Lines are updated by feature systems (e.g., ConnectionSystem in Polygons)
            // This system doesn't modify line positions
            break
        }
      }
    }
  }
}
