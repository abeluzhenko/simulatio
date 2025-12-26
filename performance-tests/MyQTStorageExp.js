const { MyQTStorage } = require('../src/storage/MyQTStorageExp')
const {
  generateRandomRect,
  generateRandomPoint,
  AREA_SIZE,
} = require('../src/storage/__tests__/testDataGenerator')
const { perfStart, perfEnd } = require('./common')

let result = []

const iterations = 10_000
const updateIterations = 100
const nearestCount = 100

const storage = new MyQTStorage({
  x: 0,
  y: 0,
  width: AREA_SIZE,
  height: AREA_SIZE,
})
const { testData, updateData, queriesData } = require('./randomData.json')
const count = testData.length

perfStart(`Inserting ${count} rectangles...`)
testData.forEach((item) => {
  storage.add(item.id, item)
})
perfEnd(`Total insertion time:`)

perfStart(`Querying intersecting rectangles ${iterations} times...`)
for (let i = 0; i < iterations; i++) {
  const rect = generateRandomRect()
  result = Array.from(storage.intersecting(rect))
}
for (const query of queriesData) {
  result = Array.from(storage.intersecting(query))
}
perfEnd(`Total intersecting querying time:`, iterations)

perfStart(`Querying ${nearestCount} nearest rectangles ${iterations} times...`)
for (let i = 0; i < iterations; i++) {
  const point = generateRandomPoint()
  result = Array.from(storage.nearest(point, nearestCount))
}
perfEnd(`Total nearest querying time:`, iterations)

perfStart(`Updating ${count} rectangles...`)
for (let i = 0; i < updateIterations; i++) {
  for (const newRect of updateData) {
    storage.update(newRect.id, newRect)
  }
}
perfEnd(`Total update time:`)

perfStart(`Deleting ${count} rectangles...`)
testData.forEach((item) => {
  storage.delete(item.id)
})
perfEnd(`Total deletion time:`)
