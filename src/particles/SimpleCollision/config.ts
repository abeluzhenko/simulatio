export type Config = {
  count: number
  bgColor: string
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
  bgColor: 'rgba(0, 0, 0, 0.05)',
  maxCount: 1_000,
  minCount: 200,
  maxSpeed: 5,
  minSpeed: 1,
  maxRadius: 4,
  minRadius: 1,
  density: 1,
}
