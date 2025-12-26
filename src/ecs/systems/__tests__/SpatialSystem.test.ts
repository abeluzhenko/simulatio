import { World } from '../../World'
import { BoundingBox } from '../../components/BoundingBox'
import { SpatialSystem } from '../SpatialSystem'
import { SimpleStorage } from '../../../storage/SimpleStorage'
import { MyQTStorage } from '../../../storage/MyQTStorage'
import { RBushStorage } from '../../../storage/RBushStorage'
import { SimpleQTStorage } from '../../../storage/SimpleQTStorage'

describe('SpatialSystem', () => {
  let world: World

  beforeEach(() => {
    world = new World()
  })

  const testStorageImplementations = [
    { name: 'SimpleStorage', create: () => new SimpleStorage() },
    {
      name: 'MyQTStorage',
      create: () =>
        new MyQTStorage({ x: 0, y: 0, width: 1000, height: 1000 }),
    },
    {
      name: 'SimpleQTStorage',
      create: () =>
        new SimpleQTStorage({ x: 0, y: 0, width: 1000, height: 1000 }),
    },
    {
      name: 'RBushStorage',
      create: () => new RBushStorage({ maxItemsPerNode: 9 }),
    },
  ]

  testStorageImplementations.forEach(({ name, create }) => {
    describe(`with ${name}`, () => {
      let system: SpatialSystem

      beforeEach(() => {
        system = new SpatialSystem(world, create())
        system.init()
      })

      afterEach(() => {
        system.destroy()
      })

      it('should add entities to spatial index on update', () => {
        const entity = world.createEntity()
        world.addComponent(entity, new BoundingBox(10, 10, 20, 20))
        world.flush()

        system.update(0)

        const results = Array.from(
          system.intersecting({ x: 0, y: 0, width: 100, height: 100 })
        )
        expect(results).toContain(entity)
      })

      it('should update entity positions in spatial index', () => {
        const entity = world.createEntity()
        const bbox = new BoundingBox(10, 10, 20, 20)
        world.addComponent(entity, bbox)
        world.flush()

        system.update(0)

        // Query original position
        let results = Array.from(
          system.intersecting({ x: 0, y: 0, width: 50, height: 50 })
        )
        expect(results).toContain(entity)

        // Move entity
        bbox.rect.x = 100
        bbox.rect.y = 100
        system.update(0)

        // Query new position
        results = Array.from(
          system.intersecting({ x: 80, y: 80, width: 50, height: 50 })
        )
        expect(results).toContain(entity)

        // Old position should be empty
        results = Array.from(
          system.intersecting({ x: 0, y: 0, width: 50, height: 50 })
        )
        expect(results).not.toContain(entity)
      })

      it('should remove destroyed entities from spatial index', () => {
        const entity = world.createEntity()
        world.addComponent(entity, new BoundingBox(10, 10, 20, 20))
        world.flush()

        system.update(0)

        let results = Array.from(
          system.intersecting({ x: 0, y: 0, width: 100, height: 100 })
        )
        expect(results).toContain(entity)

        world.destroyEntity(entity)
        world.flush()
        system.update(0)

        results = Array.from(
          system.intersecting({ x: 0, y: 0, width: 100, height: 100 })
        )
        expect(results).not.toContain(entity)
      })

      it('should query intersecting entities correctly', () => {
        const e1 = world.createEntity()
        const e2 = world.createEntity()
        const e3 = world.createEntity()

        world.addComponent(e1, new BoundingBox(0, 0, 10, 10))
        world.addComponent(e2, new BoundingBox(50, 50, 10, 10))
        world.addComponent(e3, new BoundingBox(100, 100, 10, 10))
        world.flush()

        system.update(0)

        // Query that intersects e1 and e2 but not e3
        const results = Array.from(
          system.intersecting({ x: 0, y: 0, width: 70, height: 70 })
        )

        expect(results).toContain(e1)
        expect(results).toContain(e2)
        expect(results).not.toContain(e3)
      })

      it('should query nearest entities correctly', () => {
        const e1 = world.createEntity()
        const e2 = world.createEntity()
        const e3 = world.createEntity()

        world.addComponent(e1, new BoundingBox(10, 10, 5, 5))
        world.addComponent(e2, new BoundingBox(50, 50, 5, 5))
        world.addComponent(e3, new BoundingBox(100, 100, 5, 5))
        world.flush()

        system.update(0)

        const results = Array.from(system.nearest({ x: 0, y: 0 }, 2))

        expect(results).toHaveLength(2)
        expect(results[0]).toBe(e1) // Closest
        expect(results[1]).toBe(e2) // Second closest
      })

      it('should handle multiple entities efficiently', () => {
        const entities = []
        for (let i = 0; i < 1000; i++) {
          const entity = world.createEntity()
          world.addComponent(
            entity,
            new BoundingBox(i * 10, i * 10, 5, 5)
          )
          entities.push(entity)
        }
        world.flush()

        const start = performance.now()
        system.update(0)
        const elapsed = performance.now() - start

        expect(elapsed).toBeLessThan(100) // Should be fast

        // Verify query works
        const results = Array.from(
          system.intersecting({ x: 0, y: 0, width: 100, height: 100 })
        )
        expect(results.length).toBeGreaterThan(0)
      })

      it('should handle entities without BoundingBox component', () => {
        const e1 = world.createEntity()
        const e2 = world.createEntity()

        world.addComponent(e1, new BoundingBox(10, 10, 20, 20))
        // e2 has no BoundingBox
        world.flush()

        expect(() => {
          system.update(0)
        }).not.toThrow()

        const results = Array.from(
          system.intersecting({ x: 0, y: 0, width: 100, height: 100 })
        )
        expect(results).toContain(e1)
        expect(results).not.toContain(e2)
      })

      it('should remove entities when BoundingBox component is removed', () => {
        const entity = world.createEntity()
        world.addComponent(entity, new BoundingBox(10, 10, 20, 20))
        world.flush()

        system.update(0)

        let results = Array.from(
          system.intersecting({ x: 0, y: 0, width: 100, height: 100 })
        )
        expect(results).toContain(entity)

        world.removeComponent(entity, BoundingBox)
        world.flush()
        system.update(0)

        results = Array.from(
          system.intersecting({ x: 0, y: 0, width: 100, height: 100 })
        )
        expect(results).not.toContain(entity)
      })
    })
  })
})
