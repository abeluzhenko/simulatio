import { Item } from '../simulation/common'

export type Particle = Item & {
  render(ctx: CanvasRenderingContext2D): void
}
