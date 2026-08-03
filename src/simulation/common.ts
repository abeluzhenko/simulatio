import { Rect } from '../math/Rect'
import { Storage, ItemId } from '../storage/Storage'

/**
 * Target frame time for physics calculations at 60 FPS.
 * Physics was originally tuned for 60 FPS, so we use this as the baseline
 * for dt scaling to maintain framerate-independent behavior.
 */
export const PHYSICS_TARGET_DT = 1000 / 60 // 16.67ms

export type Item = {
  readonly id: ItemId
  readonly rect: Rect
  update(storage: Storage<Item>, world: World, timestamp?: number): void
  afterUpdate?: () => void
  destroy(): void
}

export type ItemFactory<I extends Item> = (data: {
  id: ItemId
  world: World
  storage: Storage<I>
}) => I

export type Seed = number

export type World = {
  readonly width: number
  readonly height: number
  readonly particleCount: number
}
