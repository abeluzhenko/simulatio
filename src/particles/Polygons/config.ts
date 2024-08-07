export type Config = {
  count: number
  bgColor: number
  maxCount: number
  minCount: number
  maxSpeed: number
  minSpeed: number
  maxConnections: number
  range: number
}

export const defaultConfig: Config = {
  count: 1_000,
  bgColor: 0x000000ff,
  maxCount: 2_000,
  minCount: 500,
  maxSpeed: 2,
  minSpeed: 1,
  maxConnections: 10_000,
  range: 100,
}
