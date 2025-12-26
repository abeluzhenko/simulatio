const { performance } = require('perf_hooks')

let start = 0
let end = 0

function perfStart(message) {
  console.log('\n')
  console.log(message)
  start = performance.now()
}
function perfEnd(message, count) {
  end = performance.now()
  const time = end - start
  console.log(
    message,
    `${time.toFixed(2)}ms`,
    count ? `, average: ${(time / count).toFixed(2)}ms` : '',
  )
}

module.exports = {
  perfStart,
  perfEnd,
}
