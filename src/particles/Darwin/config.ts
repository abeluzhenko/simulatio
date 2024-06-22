export type Config = {
  count: number
  bgColor: string
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
  bgColor: 'rgba(0, 0, 0, 0.05)',
  maxCount: 6_000,
  minCount: 1_000,
  maxSpeed: 5,
  minSpeed: 1,
  maxRadius: 4,
  minRadius: 1,
  absorbRate: 0.3,
  massThreshold: 40,
}
