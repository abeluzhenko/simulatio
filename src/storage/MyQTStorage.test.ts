import { MyQTStorage } from './MyQTStorage'

const WORLD_BBOX = { x: 0, y: 0, width: 100, height: 100 }

describe('MyQTStorage', () => {
  describe('add', () => {
    it('should add items', () => {
      const storage = new MyQTStorage(WORLD_BBOX)
      const item1 = { id: 0, rect: { x: 0, y: 0, width: 10, height: 10 } }
      const item2 = { id: 1, rect: { x: 10, y: 10, width: 10, height: 10 } }

      storage.add(item1.id, item1)
      storage.add(item2.id, item2)

      const result1 = storage.get(item1.id)
      const result2 = storage.get(item2.id)

      expect(result1).toBe(item1)
      expect(result2).toBe(item2)
    })
  })

  it('should get item by id', () => {
    const storage = new MyQTStorage(WORLD_BBOX)
    const item = { id: 0, rect: { x: 0, y: 0, width: 10, height: 10 } }

    storage.add(item.id, item)

    const result = storage.get(item.id)
    expect(result).toBe(item)
  })

  it('should update item rect', () => {
    const storage = new MyQTStorage(WORLD_BBOX)
    const item = { id: 0, rect: { x: 0, y: 0, width: 10, height: 10 } }

    storage.add(item.id, item)
    storage.update(item.id, { x: 10, y: 10, width: 10, height: 10 })

    const result = storage.get(item.id)
    expect(result).toEqual({
      id: 0,
      rect: { x: 10, y: 10, width: 10, height: 10 },
    })
  })

  it('should delete item by id', () => {
    const storage = new MyQTStorage(WORLD_BBOX)
    const item = { id: 0, rect: { x: 0, y: 0, width: 10, height: 10 } }

    storage.add(item.id, item)
    storage.delete(item.id)

    const result = storage.get(item.id)
    expect(result).toBeNull()
  })

  describe('intersections', () => {
    it('should iterate over intersecting items', () => {
      const storage = new MyQTStorage(WORLD_BBOX)
      const item1 = { id: 0, rect: { x: 0, y: 0, width: 10, height: 10 } }
      const item2 = { id: 1, rect: { x: 5, y: 5, width: 10, height: 10 } }
      const item3 = { id: 2, rect: { x: 11, y: 11, width: 10, height: 10 } }

      storage.add(item1.id, item1)
      storage.add(item2.id, item2)
      storage.add(item3.id, item3)

      const result = Array.from(
        storage.intersecting({ x: 0, y: 0, width: 10, height: 10 }),
      )

      expect(result).toContain(item1)
      expect(result).toContain(item2)
      expect(result).not.toContain(item3)
    })

    it('should return items if there are 1px intersections', () => {
      const storage = new MyQTStorage(WORLD_BBOX)
      const item1 = { id: 0, rect: { x: 0, y: 0, width: 10, height: 10 } }
      const item2 = { id: 1, rect: { x: 10, y: 10, width: 10, height: 10 } }

      storage.add(item1.id, item1)
      storage.add(item2.id, item2)

      const result = Array.from(
        storage.intersecting({ x: 20, y: 20, width: 10, height: 10 }),
      )
      expect(result).toEqual([item2])
    })

    it('should return empty array if there are no intersections', () => {
      const storage = new MyQTStorage(WORLD_BBOX)
      const item1 = { id: 0, rect: { x: 0, y: 0, width: 4, height: 4 } }
      const item2 = { id: 1, rect: { x: 10, y: 10, width: 10, height: 10 } }

      storage.add(item1.id, item1)
      storage.add(item2.id, item2)

      const result = Array.from(
        storage.intersecting({ x: 5, y: 5, width: 4, height: 4 }),
      )
      expect(result).toEqual([])
    })

    it('should return empty array if there are no items', () => {
      const storage = new MyQTStorage(WORLD_BBOX)
      const result = Array.from(
        storage.intersecting({ x: 0, y: 0, width: 10, height: 10 }),
      )
      expect(result).toEqual([])
    })
  })

  describe('nearest', () => {
    it('should return k nearest items', () => {
      const storage = new MyQTStorage(WORLD_BBOX)
      const item1 = { id: 0, rect: { x: 0, y: 0, width: 10, height: 10 } }
      const item2 = { id: 1, rect: { x: 10, y: 10, width: 10, height: 10 } }
      const item3 = { id: 2, rect: { x: 50, y: 50, width: 10, height: 10 } }

      storage.add(item1.id, item1)
      storage.add(item2.id, item2)
      storage.add(item3.id, item3)

      const result = Array.from(storage.nearest({ x: 20, y: 20 }, 3))
      expect(result).toEqual([item2, item1, item3])
    })

    it('should return null if there are no items', () => {
      const storage = new MyQTStorage(WORLD_BBOX)
      const result = Array.from(storage.nearest({ x: 20, y: 20 }, 1))
      expect(result).toEqual([])
    })
  })
})
