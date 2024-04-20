export class PriorityQueue<T> {
  length = 0

  constructor(
    private compare: (a: T, b: T) => number,
    private data: T[] = [],
  ) {
    this.data = data
    this.length = this.data.length
    this.compare = compare

    if (this.length > 0) {
      for (let i = (this.length >> 1) - 1; i >= 0; i--) this._down(i)
    }
  }

  push(item: T) {
    this.data.push(item)
    this._up(this.length++)
  }

  pop(): T | undefined {
    if (this.length === 0) return undefined

    const top = this.data[0]
    const bottom = this.data.pop()!

    if (--this.length > 0) {
      this.data[0] = bottom
      this._down(0)
    }

    return top
  }

  peek(): T | undefined {
    return this.data[0]
  }

  private _up(pos: number) {
    const { data, compare } = this
    const item = data[pos]

    while (pos > 0) {
      const parent = (pos - 1) >> 1
      const current = data[parent]
      if (compare(item, current) >= 0) break
      data[pos] = current
      pos = parent
    }

    data[pos] = item
  }

  private _down(pos: number) {
    const { data, compare } = this
    const halfLength = this.length >> 1
    const item = data[pos]

    while (pos < halfLength) {
      let bestChild = (pos << 1) + 1
      const right = bestChild + 1

      if (right < this.length && compare(data[right], data[bestChild]) < 0) {
        bestChild = right
      }
      if (compare(data[bestChild], item) >= 0) break

      data[pos] = data[bestChild]
      pos = bestChild
    }

    data[pos] = item
  }
}
