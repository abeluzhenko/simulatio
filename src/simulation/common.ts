import { Storage, ItemId } from '../storage/Storage'

export type Item = {
  id: ItemId
  update(storage: Storage<Item>, world: World, timestamp?: number): void
  destroy(): void
}

export type ItemFactory<I extends Item> = (data: {
  id: ItemId
  world: World
  storage: Storage<I>
}) => I

export type Seed = number

export type World = {
  width: number
  height: number
}
