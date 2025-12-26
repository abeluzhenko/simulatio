const { SimpleStorage } = require('../src/storage/SimpleStorage.ts')
const { RBushStorage } = require('../src/storage/RBushStorage')
const { SimpleQTStorage } = require('../src/storage/SimpleQTStorage')
const { MyQTStorage } = require('../src/storage/MyQTStorage')
const { MyQTStorageExp } = require('../src/storage/MyQTStorageExp')
const {
  generateRandomRect,
  generateRandomPoint,
  AREA_SIZE,
} = require('../src/storage/__tests__/testDataGenerator')
const { perfStart, perfEnd } = require('./common')
const { parseArgs } = require('node:util')

const STORAGES = {
  simple: () => new SimpleStorage(),
  rbush: () => new RBushStorage(),
  simpleqt: () => new SimpleQTStorage(),
  myqt: () =>
    new MyQTStorage({
      x: 0,
      y: 0,
      width: AREA_SIZE,
      height: AREA_SIZE,
    }),
  myqtexp: () =>
    new MyQTStorageExp({
      x: 0,
      y: 0,
      width: AREA_SIZE,
      height: AREA_SIZE,
    }),
}

const options = {
  test: {
    alias: 't',
    type: 'string',
    default: 'myqt',
  },
  base: {
    alias: 'b',
    type: 'string',
    default: `myqtexp`,
  },
  iterations: {
    alias: 'i',
    type: 'string',
    default: '1000',
  },
  updateIterations: {
    alias: 'u',
    type: 'string',
    default: '100',
  },
  nearestCount: {
    alias: 'n',
    type: 'string',
    default: '100',
  },
}

function getReport({
  storage,
  testData,
  updateData,
  queriesData,
  iterations,
  updateIterations,
  nearestCount,
}) {
  const report = {
    insertion: 0,
    intersecting: 0,
    nearest: 0,
    update: 0,
    deletion: 0,
  }
  const count = testData.length

  // save result to prevent optimization
  let result = []

  perfStart(`Inserting ${count} rectangles...`)
  testData.forEach((item) => {
    storage.add(item.id, item)
  })
  report.insertion = perfEnd(`Total insertion time:`)

  perfStart(`Querying intersecting rectangles ${iterations} times...`)
  for (let i = 0; i < iterations; i++) {
    const rect = generateRandomRect()
    result = Array.from(storage.intersecting(rect))
  }
  for (const query of queriesData) {
    result = Array.from(storage.intersecting(query))
  }
  report.intersecting = perfEnd(`Total intersecting querying time:`, iterations)

  perfStart(
    `Querying ${nearestCount} nearest rectangles ${iterations} times...`,
  )
  for (let i = 0; i < iterations; i++) {
    const point = generateRandomPoint()
    result = Array.from(storage.nearest(point, nearestCount))
  }
  report.nearest = perfEnd(`Total nearest querying time:`, iterations)

  perfStart(`Updating ${count} rectangles...`)
  for (let i = 0; i < updateIterations; i++) {
    for (const newRect of updateData) {
      storage.update(newRect.id, newRect)
    }
  }
  report.update = perfEnd(`Total update time:`)

  perfStart(`Deleting ${count} rectangles...`)
  testData.forEach((item) => {
    storage.delete(item.id)
  })
  report.deletion = perfEnd(`Total deletion time:`)

  return report
}

const { values: args } = parseArgs({ options })

const { test, base, iterations, updateIterations, nearestCount } = args

// @todo: add error handling
const { testData, updateData, queriesData } = require('./randomData.json')

// @todo: add error handling
const testStorage = STORAGES[test]()
const testReport = getReport({
  storage: testStorage,
  testData,
  updateData,
  queriesData,
  iterations,
  updateIterations,
  nearestCount,
})

const baseStorage = STORAGES[base]()
const baseReport = getReport({
  storage: baseStorage,
  testData,
  updateData,
  queriesData,
  iterations,
  updateIterations,
  nearestCount,
})
