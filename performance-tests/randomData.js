const {
  generateRandomRect,
} = require('../src/storage/__tests__/testDataGenerator')
const { parseArgs } = require('node:util')
const fs = require('node:fs')

const DEFAULT_FILE_PATH = './randomData.json'
const DEFAULT_COUNT = 100_000
const DEFAULT_QUERY_COUNT = 10_000

const options = {
  file: {
    alias: 'f',
    type: 'string',
    default: DEFAULT_FILE_PATH,
  },
  count: {
    alias: 'c',
    type: 'string',
    default: `${DEFAULT_COUNT}`,
  },
  queriesCount: {
    alias: 'q',
    type: 'string',
    default: `${DEFAULT_QUERY_COUNT}`,
  },
}
const { values: args } = parseArgs({ options })

console.log(`Generating ${args.count} random rectangles...`)

const count = parseInt(args.count, 10)
const testData = Array.from({ length: count }, (_, id) => {
  const rect = generateRandomRect()
  return { id, rect }
})

console.log(`Generating ${args.count} random updates...`)
const updateData = Array.from({ length: count }, (_, id) => {
  const rect = generateRandomRect()
  return { id, rect }
})

console.log(`Generating ${args.count} random queries...`)
const queriesCount = parseInt(args.queryCount, 10)
const queriesData = Array.from({ length: queriesCount }, (_, id) => {
  const rect = generateRandomRect()
  return { id, rect }
})

fs.writeFileSync(
  args.file,
  JSON.stringify({ testData, updateData, queriesData }, null, 2),
)

console.log(`Random data has saved to ${args.file}`)
