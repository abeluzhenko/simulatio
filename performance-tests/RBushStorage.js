const { RBushStorage } = require('../src/storage/RBushStorage')
const {
  generateRandomRect,
  generateRandomPoint,
} = require('../src/storage/__tests__/testDataGenerator')
const { perfStart, perfEnd } = require('./common')

let result = []

const count = 100_000
const iterations = 10_000
const nearestCount = 100

const storage = new RBushStorage()
const testData = Array.from({ length: count }, (_, id) => {
  const rect = generateRandomRect()
  return { id, rect }
})

perfStart(`Inserting ${count} rectangles...`)
testData.forEach((item) => {
  storage.add(item.id, item)
})
perfEnd(`Total insertion time:`)

perfStart(`Updating ${count} rectangles...`)
testData.forEach((item) => {
  const newRect = generateRandomRect()
  storage.update(item.id, newRect)
})
perfEnd(`Total update time:`)

perfStart(`Querying intersecting rectangles ${iterations} times...`)
for (let i = 0; i < iterations; i++) {
  const rect = generateRandomRect()
  result = Array.from(storage.intersecting(rect))
}
perfEnd(`Total intersecting querying time:`, result.length)

perfStart(`Querying ${nearestCount} nearest rectangles ${iterations} times...`)
for (let i = 0; i < iterations; i++) {
  const point = generateRandomPoint()
  result = Array.from(storage.nearest(point, nearestCount))
}
perfEnd(`Total nearest querying time:`, result.length)

perfStart(`Deleting ${count} rectangles...`)
testData.forEach((item) => {
  storage.delete(item.id)
})
perfEnd(`Total deletion time:`)
