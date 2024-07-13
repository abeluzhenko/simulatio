import { PriorityQueue } from './PriorityQueue' // Adjust the import path according to your file structure

describe('PriorityQueue', () => {
  it('should initialize an empty priority queue', () => {
    const compareNumbers = (a: number, b: number) => a - b
    const pq = new PriorityQueue<number>(compareNumbers)
    expect(pq.length).toBe(0)
    expect(pq.peek()).toBeUndefined()
  })

  it('should initialize a priority queue with initial data', () => {
    const compareNumbers = (a: number, b: number) => a - b
    const pq = new PriorityQueue<number>(compareNumbers, [5, 3, 8, 1])
    expect(pq.length).toBe(4)
    expect(pq.peek()).toBe(1)
  })

  it('should correctly push elements into the priority queue', () => {
    const compareNumbers = (a: number, b: number) => a - b
    const pq = new PriorityQueue<number>(compareNumbers)
    pq.push(5)
    pq.push(3)
    pq.push(8)
    pq.push(1)
    expect(pq.length).toBe(4)
    expect(pq.peek()).toBe(1)
  })

  it('should correctly pop elements from the priority queue', () => {
    const compareNumbers = (a: number, b: number) => a - b
    const pq = new PriorityQueue<number>(compareNumbers)
    pq.push(5)
    pq.push(3)
    pq.push(8)
    pq.push(1)
    expect(pq.pop()).toBe(1)
    expect(pq.pop()).toBe(3)
    expect(pq.pop()).toBe(5)
    expect(pq.pop()).toBe(8)
    expect(pq.pop()).toBeUndefined()
  })

  it('should handle custom comparison functions', () => {
    const compareStrings = (a: string, b: string) => a.length - b.length
    const pq = new PriorityQueue<string>(compareStrings)
    pq.push('apple')
    pq.push('banana')
    pq.push('kiwi')
    pq.push('strawberry')
    expect(pq.pop()).toBe('kiwi')
    expect(pq.pop()).toBe('apple')
    expect(pq.pop()).toBe('banana')
    expect(pq.pop()).toBe('strawberry')
  })

  it('should handle edge case of popping from an empty queue', () => {
    const compareNumbers = (a: number, b: number) => a - b
    const pq = new PriorityQueue<number>(compareNumbers)
    expect(pq.pop()).toBeUndefined()
  })

  it('should maintain correct length during operations', () => {
    const compareNumbers = (a: number, b: number) => a - b
    const pq = new PriorityQueue<number>(compareNumbers)
    pq.push(5)
    pq.push(3)
    expect(pq.length).toBe(2)
    pq.pop()
    expect(pq.length).toBe(1)
    pq.pop()
    expect(pq.length).toBe(0)
  })
})
