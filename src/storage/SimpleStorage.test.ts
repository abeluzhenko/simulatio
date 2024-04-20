import { SimpleStorage } from './SimpleStorage'

describe('SimpleStorage', () => {
  it('should add items', () => {
    const storage = new SimpleStorage()
    const item1 = { id: 0, bbox: { x: 0, y: 0, width: 10, height: 10 } }
    const item2 = { id: 1, bbox: { x: 10, y: 10, width: 10, height: 10 } }

    storage.add(item1.id, item1)
    storage.add(item2.id, item2)

    const result1 = storage.get(item1.id)
    const result2 = storage.get(item2.id)

    expect(result1).toBe(item1)
    expect(result2).toBe(item2)
  })

  it('should get item by id', () => {
    const storage = new SimpleStorage()
    const item = { id: 0, bbox: { x: 0, y: 0, width: 10, height: 10 } }

    storage.add(item.id, item)

    const result = storage.get(item.id)
    expect(result).toBe(item)
  })

  it('should update item bbox', () => {
    const storage = new SimpleStorage()
    const item = { id: 0, bbox: { x: 0, y: 0, width: 10, height: 10 } }

    storage.add(item.id, item)
    storage.update(item.id, { x: 10, y: 10, width: 10, height: 10 })

    const result = storage.get(item.id)
    expect(result).toEqual({
      id: 0,
      bbox: { x: 10, y: 10, width: 10, height: 10 },
    })
  })

  it('should delete item by id', () => {
    const storage = new SimpleStorage()
    const item = { id: 0, bbox: { x: 0, y: 0, width: 10, height: 10 } }

    storage.add(item.id, item)
    storage.delete(item.id)

    const result = storage.get(item.id)
    expect(result).toBeNull()
  })

  describe('intersections', () => {
    it('should iterate over intersecting items', () => {
      const storage = new SimpleStorage()
      const item1 = { id: 0, bbox: { x: 0, y: 0, width: 10, height: 10 } }
      const item2 = { id: 1, bbox: { x: 5, y: 5, width: 10, height: 10 } }
      const item3 = { id: 2, bbox: { x: 11, y: 11, width: 10, height: 10 } }

      storage.add(item1.id, item1)
      storage.add(item2.id, item2)
      storage.add(item3.id, item3)

      const result = Array.from(
        storage.intersecting({ x: 0, y: 0, width: 10, height: 10 }),
      )
      expect(result).toEqual([item1, item2])
    })

    it('should return items if there are 1px intersections', () => {
      const storage = new SimpleStorage()
      const item1 = { id: 0, bbox: { x: 0, y: 0, width: 10, height: 10 } }
      const item2 = { id: 1, bbox: { x: 10, y: 10, width: 10, height: 10 } }

      storage.add(item1.id, item1)
      storage.add(item2.id, item2)

      const result = Array.from(
        storage.intersecting({ x: 20, y: 20, width: 10, height: 10 }),
      )
      expect(result).toEqual([item2])
    })

    it('should return empty array if there are no intersections', () => {
      const storage = new SimpleStorage()
      const item1 = { id: 0, bbox: { x: 0, y: 0, width: 4, height: 4 } }
      const item2 = { id: 1, bbox: { x: 10, y: 10, width: 10, height: 10 } }

      storage.add(item1.id, item1)
      storage.add(item2.id, item2)

      const result = Array.from(
        storage.intersecting({ x: 5, y: 5, width: 4, height: 4 }),
      )
      expect(result).toEqual([])
    })

    it('should return empty array if there are no items', () => {
      const storage = new SimpleStorage()
      const result = Array.from(
        storage.intersecting({ x: 0, y: 0, width: 10, height: 10 }),
      )
      expect(result).toEqual([])
    })
  })

  describe('nearest', () => {
    it('should return the nearest item', () => {
      const storage = new SimpleStorage()
      const item1 = { id: 0, bbox: { x: 0, y: 0, width: 10, height: 10 } }
      const item2 = { id: 1, bbox: { x: 10, y: 10, width: 10, height: 10 } }

      storage.add(item1.id, item1)
      storage.add(item1.id, item2)

      const result = storage.nearest({ x: 20, y: 20 })
      expect(result).toEqual(item2)
    })

    it('should return null if there are no items', () => {
      const storage = new SimpleStorage()
      const result = storage.nearest({ x: 20, y: 20 })
      expect(result).toBeNull()
    })
  })
})
