import { Rect } from '../math/Rect'
import { Storage, ItemId } from '../storage/Storage'

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
