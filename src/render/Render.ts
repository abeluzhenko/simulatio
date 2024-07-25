import { Rect } from '../math/Rect'
import { ItemId } from '../storage/Storage'
import { Graphics } from './Graphics'

export type RenderItem = {
  id: ItemId
  rect: Rect
  graphics: Graphics[]
}

export type RenderConfig = {
  vpHeight: number
  vpWidth: number
  bgColor?: string
  debug?: string
}

export type Render = {
  updateConfig(config: Partial<RenderConfig>): void
  tick(): void
  destroy(): void
}
