export type Config = {
  count: number
  bgColor: number
  maxCount: number
  minCount: number
  maxSpeed: number
  minSpeed: number
  maxRadius: number
  minRadius: number
  absorbRate: number
  massThreshold: number
}

export const defaultConfig: Config = {
  count: 4_000,
  bgColor: 0x000000ff,
  maxCount: 6_000,
  minCount: 1_000,
  maxSpeed: 5,
  minSpeed: 1,
  maxRadius: 4,
  minRadius: 1,
  absorbRate: 0.3,
  massThreshold: 40,
}
