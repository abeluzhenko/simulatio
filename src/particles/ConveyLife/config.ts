export type Config = {
  count: number
  bgColor: number
  minCount: number
  maxCount: number
  stepTimeMs: number
  borderSize: number
}

export const defaultConfig: Config = {
  count: 10_000,
  bgColor: 0x000000ff,
  minCount: 10_000,
  maxCount: 10_000,
  stepTimeMs: 80,
  borderSize: 1,
}
