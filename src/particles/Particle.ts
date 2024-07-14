import { Graphics } from '../render/Graphics'
import { Item } from '../simulation/common'

export type Particle = Item & { readonly graphics: Graphics[] }

export function createGraphics<A extends Graphics, R extends Graphics[]>(
  shape: A,
  ...shapes: R
): [A, ...R] {
  return [shape, ...shapes]
}
