import { List } from '../common/List'

export type Frame = {
  id: number
  simulation: number
  render: number
  total: number
}

// @todo: move somewhere else
export const PERFORMANCE_FRAME = 'performance_frame'
export const PERFORMANCE_START = 'performance_start'
export const PERFORMANCE_RESET = 'performance_reset'

export class Metric {
  private frameIndex = 0
  private currentFrame = { simulation: 0, render: 0, total: 0 }
  private dataIndex = 0
  private head: List<Frame> = {
    data: { id: 0, simulation: 0, render: 0, total: 0 },
    next: undefined,
  }
  private current = this.head

  public onBufferFull?: () => void
  public onFrame?: (frame: Frame) => void

  constructor(
    private readonly config: { framesInBuffer: number; bufferSize: number },
  ) {}

  reset() {
    this.frameIndex = 0
    this.currentFrame = { simulation: 0, render: 0, total: 0 }
    this.dataIndex = 0
    this.head = {
      data: { id: 0, simulation: 0, render: 0, total: 0 },
      next: undefined,
    }
    this.current = this.head
  }

  addFrame(frame: Omit<Frame, 'id'>) {
    this.currentFrame.simulation += frame.simulation
    this.currentFrame.render += frame.render
    this.currentFrame.total += frame.total
    this.frameIndex++

    if (this.frameIndex === this.config.framesInBuffer) {
      this.frameIndex = 0
      this.current.next = {
        data: {
          id: this.dataIndex++,
          simulation: this.currentFrame.simulation / this.config.framesInBuffer,
          render: this.currentFrame.render / this.config.framesInBuffer,
          total: this.currentFrame.total / this.config.framesInBuffer,
        },
        next: undefined,
      }

      this.currentFrame.simulation = 0
      this.currentFrame.render = 0
      this.currentFrame.total = 0
      this.current = this.current.next

      if (this.dataIndex === this.config.bufferSize) {
        this.onBufferFull?.()
      }

      if (this.dataIndex >= this.config.bufferSize) {
        if (!this.head.next) {
          new Error('Impossible state')
        }
        this.head = this.head.next!
      }
    }

    this.onFrame?.(this.current.data)
  }

  *data(): IterableIterator<Frame> {
    let current: List<Frame> | undefined = this.head
    while (current) {
      yield current.data
      current = current.next
    }
  }

  toJSON() {
    return JSON.stringify([...this.data()], null, 2)
  }

  toCSV() {
    let data = 'simulation,render,total\n'
    for (const frame of this.data()) {
      data += `${frame.simulation},${frame.render},${frame.total}\n`
    }
    return data
  }
}
