export type Config = {
  count: number
  bgColor: string
  minCount: number
  maxCount: number
  stepTimeMs: number
  borderSize: number
}

export const defaultConfig: Config = {
  count: 10_000,
  bgColor: 'rgba(0, 0, 0, 0.1)',
  minCount: 10_000,
  maxCount: 10_000,
  stepTimeMs: 80,
  borderSize: 1,
}
