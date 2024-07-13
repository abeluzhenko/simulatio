import { MyQTStorage } from '../MyQTStorage'
import {
  generateRandomRect,
  generateRandomPoint,
  generateExpectedIntersecting,
  generateExpectedNearest,
  TestItem,
  AREA_SIZE,
} from './testDataGenerator'
import { Rect } from '../../math/Rect'

const DATA_SIZE = 10_000

function addItems(storage: MyQTStorage, testData: TestItem[]) {
  for (const item of testData) {
    storage.add(item.id, item)
  }
}

describe('MyQTStorage random', () => {
  let storage: MyQTStorage
  let testData: TestItem[]

  beforeEach(() => {
    const initialRect: Rect = {
      x: 0,
      y: 0,
      width: AREA_SIZE,
      height: AREA_SIZE,
    }
    storage = new MyQTStorage(initialRect)
    testData = []
    for (let i = 0; i < DATA_SIZE; i++) {
      const rect = generateRandomRect()
      testData.push({ id: i, rect })
    }
  })

  afterEach(() => {
    storage.clear()
  })

  it('should correctly add items', () => {
    addItems(storage, testData)

    testData.forEach((item) => {
      const storedItem = storage.get(item.id)
      expect(storedItem).toEqual(item)
    })
  })

  it('should correctly update items', () => {
    addItems(storage, testData)

    testData.forEach((item) => {
      const rect = generateRandomRect()
      storage.update(item.id, rect)
      const updatedItem = storage.get(item.id)

      expect(updatedItem?.rect).toEqual(rect)
    })
  })

  it('should correctly delete items', () => {
    addItems(storage, testData)

    testData.forEach((item) => {
      storage.delete(item.id)
      const deletedItem = storage.get(item.id)

      expect(deletedItem).toBeNull()
    })
  })

  it('should correctly query intersecting items', () => {
    addItems(storage, testData)
    const queryRect = generateRandomRect()
    const expectedResult = generateExpectedIntersecting(testData, queryRect)

    const queryResult = Array.from(storage.intersecting(queryRect)).sort(
      (a, b) => a.id - b.id,
    )

    expect(queryResult).toEqual(expectedResult)
  })

  // @todo: make this method stable
  it.skip('should correctly query nearest neighbors', () => {
    addItems(storage, testData)
    const queryPoint = generateRandomPoint()
    const k = 10
    const expectedResultNearest = generateExpectedNearest(
      testData,
      queryPoint,
      k,
    )

    const queryResultNearest = Array.from(storage.nearest(queryPoint, k))

    expect(queryResultNearest).toEqual(expectedResultNearest)
  })
})
