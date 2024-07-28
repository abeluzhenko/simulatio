export type Config = {
  count: number
  bgColor: number
  maxCount: number
  minCount: number
  maxSpeed: number
  minSpeed: number
  maxRadius: number
  minRadius: number
  density: number
}

export const defaultConfig: Config = {
  count: 400,
  bgColor: 0x000000ff,
  maxCount: 1_000,
  minCount: 200,
  maxSpeed: 5,
  minSpeed: 1,
  maxRadius: 4,
  minRadius: 1,
  density: 1,
}
