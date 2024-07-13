const { performance } = require('perf_hooks')

let start = 0
let end = 0

function perfStart(message) {
  console.log('\n')
  console.log(message)
  start = performance.now()
}
function perfEnd(message, debug = '') {
  end = performance.now()
  console.log(message, `${(end - start).toFixed(2)}ms`, debug)
}

module.exports = {
  perfStart,
  perfEnd,
}
