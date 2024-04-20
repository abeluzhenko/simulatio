import { List } from '../../common/List'
import {
  Frame,
  PERFORMANCE_FRAME,
  PERFORMANCE_START,
  PERFORMANCE_STOP,
} from '../../metric/Metric'

const FRAMES_LIMIT = 100
const FRAME_TIME = 1000 / 60
const BAR_WIDTH = 1
const BAR_SPACING = 1

let context: OffscreenCanvasRenderingContext2D
let frames: List<Frame> = {
  data: { id: 0, simulation: 0, render: 0, total: 0 },
}
let currentFrame = frames
let framesCount = 1
let height = 100
let width = 100

let startTime: number
let firstFrameTime: number

onmessage = (message) => {
  const { type, data } = message.data
  switch (type) {
    case PERFORMANCE_START: {
      startTime = performance.now()
      context = data.canvas.getContext('2d')!
      width = data.width
      height = data.height
      break
    }
    case PERFORMANCE_STOP: {
      frames = { data: { id: 0, simulation: 0, render: 0, total: 0 } }
      currentFrame = frames
      break
    }
    case PERFORMANCE_FRAME: {
      if (!firstFrameTime && data.total > 0) {
        firstFrameTime = performance.now()
      }
      addFrame(data)
      break
    }
    default:
  }
}

function addFrame(data: Frame) {
  if (data.total === 0) {
    return
  }

  currentFrame.next = { data }
  currentFrame = currentFrame.next

  framesCount++

  if (framesCount > FRAMES_LIMIT) {
    frames = frames.next
  }

  context.fillStyle = '#000000'
  context.fillRect(0, 0, width, height)

  let x = 0
  const ratio = height / (FRAME_TIME * 2)

  for (let frame = frames; frame; frame = frame.next) {
    context.fillStyle = '#ffff00'
    context.fillRect(x, height, BAR_WIDTH, -frame.data.simulation * ratio)

    context.fillStyle = '#ff00ff'
    context.fillRect(
      x,
      height - frame.data.simulation * ratio,
      BAR_WIDTH,
      -frame.data.render * ratio,
    )
    x += BAR_WIDTH + BAR_SPACING
  }

  context.strokeStyle = '#00ff00'
  context.setLineDash([2, 2])
  context.moveTo(0, height - FRAME_TIME * ratio)
  context.lineTo(width, height - FRAME_TIME * ratio)
  context.stroke()

  context.fillStyle = data.total <= FRAME_TIME ? '#00ff00' : '#ff0000'
  context.fillText(data.total.toFixed(2), 2, 10)
  context.fillText((firstFrameTime - startTime).toFixed(0), width - 30, 10)
}
