const {
  generateRandomRect,
} = require('../src/storage/__tests__/testDataGenerator')
const { parseArgs } = require('node:util')
const fs = require('node:fs')

const DEFAULT_FILE_PATH = './randomData.json'
const DEFAULT_COUNT = 100_000

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
}
const { values: args } = parseArgs({ options })

console.log(`Generating ${args.count} random rectangles...`)

const count = parseInt(args.count, 10)
const testData = Array.from({ length: count }, (_, id) => {
  const rect = generateRandomRect()
  return { id, rect }
})

fs.writeFileSync(args.file, JSON.stringify(testData, null, 2))

console.log(
  `Generated ${args.count} random rectangles and saved to ${args.file}`,
)
