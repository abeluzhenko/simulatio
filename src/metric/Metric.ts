type Frame = {
  simulation: number
  render: number
  total: number
}

const FRAMES_IN_BUFFER = 60
const BUFFER_SIZE = 100

export class Metric {
  private frameIndex = 0
  private currentFrame = { simulation: 0, render: 0, total: 0 }
  private dataIndex = 0
  private data: Frame[] = new Array(BUFFER_SIZE)

  public onBufferFull?: () => void

  addFrame(frame: Frame) {
    this.currentFrame.simulation += frame.simulation
    this.currentFrame.render += frame.render
    this.currentFrame.total += frame.total
    this.frameIndex++

    if (this.frameIndex === FRAMES_IN_BUFFER) {
      this.frameIndex = 0
      this.data[this.dataIndex++] = {
        simulation: this.currentFrame.simulation / FRAMES_IN_BUFFER,
        render: this.currentFrame.render / FRAMES_IN_BUFFER,
        total: this.currentFrame.total / FRAMES_IN_BUFFER,
      }
      if (this.dataIndex === BUFFER_SIZE) {
        this.onBufferFull?.()
        this.dataIndex = 0
      }
    }
  }

  toJSON() {
    return JSON.stringify(this.data, null, 2)
  }

  toCSV() {
    return (
      'simulation,render,total\n' +
      this.data
        .map((frame) => `${frame.simulation},${frame.render},${frame.total}`)
        .join('\n')
    )
  }
}
