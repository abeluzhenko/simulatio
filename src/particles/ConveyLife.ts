import { Rect } from '../math/Rect'
import { Item, World } from '../simulation/common'
import { Storage } from '../storage/Storage'
import { Particle } from './common'

export class ConveyLife implements Particle {
  id: number
  bbox: Rect
  update(storage: Storage<Item>, world: World, timestamp?: number): void {
    throw new Error('Method not implemented.')
  }
  destroy(): void {
    throw new Error('Method not implemented.')
  }
  render(ctx: CanvasRenderingContext2D): void {
    throw new Error('Method not implemented.')
  }
}
