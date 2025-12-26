import { Component } from '../Component'
import { World } from '../World'

// Test components
class Position implements Component {
  constructor(
    public x: number,
    public y: number,
  ) {}
}

class Velocity implements Component {
  constructor(
    public vx: number,
    public vy: number,
  ) {}
}

describe('World', () => {
  let world: World

  beforeEach(() => {
    world = new World()
  })

  describe('Entity Management', () => {
    it('should create entities with unique IDs', () => {
      const e1 = world.createEntity()
      const e2 = world.createEntity()
      const e3 = world.createEntity()

      expect(e1).toBe(1)
      expect(e2).toBe(2)
      expect(e3).toBe(3)
    })

    it('should track entity count', () => {
      expect(world.getEntityCount()).toBe(0)

      world.createEntity()
      expect(world.getEntityCount()).toBe(1)

      world.createEntity()
      world.createEntity()
      expect(world.getEntityCount()).toBe(3)
    })

    it('should destroy entities immediately when flushed', () => {
      const entity = world.createEntity()
      world.addComponent(entity, new Position(0, 0))
      world.flush()

      expect(world.hasComponent(entity, Position)).toBe(true)

      world.destroyEntity(entity)
      world.flush()

      expect(world.hasComponent(entity, Position)).toBe(false)
      expect(world.getEntityCount()).toBe(0)
    })

    it('should handle destroying non-existent entity gracefully', () => {
      expect(() => {
        world.destroyEntity(999)
        world.flush()
      }).not.toThrow()
    })
  })

  describe('Component Management', () => {
    it('should add components to entities', () => {
      const entity = world.createEntity()
      const position = new Position(10, 20)

      world.addComponent(entity, position)
      world.flush()

      expect(world.hasComponent(entity, Position)).toBe(true)
      expect(world.getComponent(entity, Position)).toBe(position)
    })

    it('should add multiple components to the same entity', () => {
      const entity = world.createEntity()
      const position = new Position(10, 20)
      const velocity = new Velocity(1, 2)

      world.addComponent(entity, position)
      world.addComponent(entity, velocity)
      world.flush()

      expect(world.hasComponent(entity, Position)).toBe(true)
      expect(world.hasComponent(entity, Velocity)).toBe(true)
      expect(world.getComponent(entity, Position)).toBe(position)
      expect(world.getComponent(entity, Velocity)).toBe(velocity)
    })

    it('should throw when adding component to non-existent entity', () => {
      expect(() => {
        world.addComponent(999, new Position(0, 0))
      }).toThrow('Entity 999 does not exist')
    })

    it('should remove components from entities', () => {
      const entity = world.createEntity()
      world.addComponent(entity, new Position(10, 20))
      world.flush()

      expect(world.hasComponent(entity, Position)).toBe(true)

      world.removeComponent(entity, Position)
      world.flush()

      expect(world.hasComponent(entity, Position)).toBe(false)
      expect(world.getComponent(entity, Position)).toBeUndefined()
    })

    it('should return undefined for non-existent components', () => {
      const entity = world.createEntity()
      expect(world.getComponent(entity, Position)).toBeUndefined()
    })

    it('should handle removing component from entity without it', () => {
      const entity = world.createEntity()
      expect(() => {
        world.removeComponent(entity, Position)
        world.flush()
      }).not.toThrow()
    })
  })

  describe('Component Queries', () => {
    it('should find entities with specific component', () => {
      const e1 = world.createEntity()
      const e2 = world.createEntity()
      const e3 = world.createEntity()

      world.addComponent(e1, new Position(1, 1))
      world.addComponent(e2, new Position(2, 2))
      world.addComponent(e3, new Velocity(1, 1))
      world.flush()

      const entities = Array.from(world.getEntitiesWithComponent(Position))
      expect(entities).toHaveLength(2)
      expect(entities).toContain(e1)
      expect(entities).toContain(e2)
      expect(entities).not.toContain(e3)
    })

    it('should return empty iterator for components with no entities', () => {
      const entities = Array.from(world.getEntitiesWithComponent(Position))
      expect(entities).toHaveLength(0)
    })

    it('should get all entities', () => {
      const e1 = world.createEntity()
      const e2 = world.createEntity()
      const e3 = world.createEntity()

      const entities = Array.from(world.getAllEntities())
      expect(entities).toHaveLength(3)
      expect(entities).toContain(e1)
      expect(entities).toContain(e2)
      expect(entities).toContain(e3)
    })
  })

  describe('Deferred Operations', () => {
    it('should defer component additions until flush', () => {
      const entity = world.createEntity()
      world.addComponent(entity, new Position(10, 20))

      // Not added yet
      expect(world.hasComponent(entity, Position)).toBe(false)

      world.flush()

      // Now added
      expect(world.hasComponent(entity, Position)).toBe(true)
    })

    it('should defer component removals until flush', () => {
      const entity = world.createEntity()
      world.addComponent(entity, new Position(10, 20))
      world.flush()

      world.removeComponent(entity, Position)

      // Still there
      expect(world.hasComponent(entity, Position)).toBe(true)

      world.flush()

      // Now removed
      expect(world.hasComponent(entity, Position)).toBe(false)
    })

    it('should defer entity destruction until flush', () => {
      const entity = world.createEntity()
      world.addComponent(entity, new Position(10, 20))
      world.flush()

      world.destroyEntity(entity)

      // Still exists
      expect(world.getEntityCount()).toBe(1)
      expect(world.hasComponent(entity, Position)).toBe(true)

      world.flush()

      // Now destroyed
      expect(world.getEntityCount()).toBe(0)
      expect(world.hasComponent(entity, Position)).toBe(false)
    })

    it('should discard pending operations for destroyed entities', () => {
      const entity = world.createEntity()
      world.addComponent(entity, new Position(10, 20))
      world.flush()

      // Queue component addition and entity destruction
      world.addComponent(entity, new Velocity(1, 1))
      world.destroyEntity(entity)
      world.flush()

      // Entity should be destroyed, component addition ignored
      expect(world.getEntityCount()).toBe(0)
      expect(world.hasComponent(entity, Velocity)).toBe(false)
    })

    it('should handle multiple flush calls', () => {
      const entity = world.createEntity()
      world.addComponent(entity, new Position(10, 20))

      world.flush()
      world.flush()
      world.flush()

      expect(world.hasComponent(entity, Position)).toBe(true)
      expect(world.getComponent(entity, Position)).toEqual(
        expect.objectContaining({ x: 10, y: 20 }),
      )
    })
  })

  describe('Clear', () => {
    it('should clear all entities and components', () => {
      const e1 = world.createEntity()
      const e2 = world.createEntity()
      world.addComponent(e1, new Position(1, 1))
      world.addComponent(e2, new Velocity(2, 2))
      world.flush()

      expect(world.getEntityCount()).toBe(2)

      world.clear()

      expect(world.getEntityCount()).toBe(0)
      expect(Array.from(world.getAllEntities())).toHaveLength(0)
    })

    it('should reset entity ID counter', () => {
      world.createEntity()
      world.createEntity()
      world.clear()

      const entity = world.createEntity()
      expect(entity).toBe(1)
    })

    it('should clear pending operations', () => {
      const entity = world.createEntity()
      world.addComponent(entity, new Position(1, 1))
      // Don't flush

      world.clear()
      world.flush()

      expect(world.getEntityCount()).toBe(0)
    })
  })

  describe('Data Integrity', () => {
    it('should maintain component data independently per entity', () => {
      const e1 = world.createEntity()
      const e2 = world.createEntity()

      const pos1 = new Position(10, 20)
      const pos2 = new Position(30, 40)

      world.addComponent(e1, pos1)
      world.addComponent(e2, pos2)
      world.flush()

      expect(world.getComponent(e1, Position)).toBe(pos1)
      expect(world.getComponent(e2, Position)).toBe(pos2)

      // Modify one component
      pos1.x = 100

      expect(world.getComponent(e1, Position)!.x).toBe(100)
      expect(world.getComponent(e2, Position)!.x).toBe(30)
    })

    it('should allow same component type on multiple entities', () => {
      const entities = []
      for (let i = 0; i < 100; i++) {
        const entity = world.createEntity()
        world.addComponent(entity, new Position(i, i * 2))
        entities.push(entity)
      }
      world.flush()

      expect(world.getEntityCount()).toBe(100)

      for (let i = 0; i < 100; i++) {
        const pos = world.getComponent(entities[i], Position)!
        expect(pos.x).toBe(i)
        expect(pos.y).toBe(i * 2)
      }
    })
  })
})
