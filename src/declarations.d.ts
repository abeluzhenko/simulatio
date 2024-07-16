declare module 'rbush-knn' {
  import RBush from 'rbush'
  export default function knn<T>(
    tree: RBush<T>,
    x: number,
    y: number,
    n: number,
  ): T[]
}

declare module 'simple-quadtree' {
  type Rect = { x: number; y: number; w: number; h: number }
  type Node = Rect & { id: number; owner: unknown }

  export default class QuadTree<T extends Node> {
    constructor(
      x: number,
      y: number,
      width: number,
      height: number,
      options: {
        maxchildren: number
        leafratio: number
      },
    )

    put(item: T): void

    get(buf: Rect): T[]
    get(buf: Rect, callback: (item: T) => undefined | boolean | T[]): void

    update(item: T, attr: keyof T, updatecoords: Rect): boolean

    remove(item: T, attr: keyof T): number

    clear(): void
  }
}

declare module '*.frag' {
  const value: string
  export default value
}

declare module '*.vert' {
  const value: string
  export default value
}
