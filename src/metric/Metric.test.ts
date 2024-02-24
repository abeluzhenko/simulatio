import { Metric } from './Metric'

describe('Metric', () => {
  test('should return data steps', () => {
    const sut = new Metric({ framesInBuffer: 2, bufferSize: 2 })

    for (let i = 0; i < 4; i++) {
      sut.addFrame({ id: i, simulation: 1, render: 1, total: 2 })
    }
    const [firstFrame, secondFrame] = sut.data()

    expect(firstFrame).toEqual({ id: 0, simulation: 1, render: 1, total: 2 })
    expect(secondFrame).toEqual({ id: 1, simulation: 1, render: 1, total: 2 })
  })

  test('should shift data steps when buffer is full', () => {
    const sut = new Metric({ framesInBuffer: 1, bufferSize: 2 })

    for (let i = 0; i < 4; i++) {
      sut.addFrame({ id: i, simulation: 1, render: 1, total: 2 })
    }
    const data = [...sut.data()]

    expect(data).toEqual([
      { id: 2, simulation: 1, render: 1, total: 2 },
      { id: 3, simulation: 1, render: 1, total: 2 },
    ])
  })

  test('should call onBufferFull when buffer is full', () => {
    const sut = new Metric({ framesInBuffer: 1, bufferSize: 2 })
    const onBufferFull = jest.fn()
    sut.onBufferFull = onBufferFull

    for (let i = 0; i < 4; i++) {
      sut.addFrame({ id: i, simulation: 1, render: 1, total: 2 })
    }

    expect(onBufferFull).toHaveBeenCalledTimes(1)
  })

  test('should return data as JSON', () => {
    const sut = new Metric({ framesInBuffer: 2, bufferSize: 2 })

    for (let i = 0; i < 4; i++) {
      sut.addFrame({ id: i, simulation: 1, render: 1, total: 2 })
    }
    const data = sut.toJSON()

    expect(data).toEqual(
      JSON.stringify(
        [
          { id: 0, simulation: 1, render: 1, total: 2 },
          { id: 1, simulation: 1, render: 1, total: 2 },
        ],
        null,
        2,
      ),
    )
  })

  test('should return data as CSV', () => {
    const sut = new Metric({ framesInBuffer: 2, bufferSize: 2 })

    for (let i = 0; i < 4; i++) {
      sut.addFrame({ id: i, simulation: 1, render: 1, total: 2 })
    }

    const data = sut.toCSV()

    expect(data).toEqual(`simulation,render,total\n1,1,2\n1,1,2\n`)
  })
})
