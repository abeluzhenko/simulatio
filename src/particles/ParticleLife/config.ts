export type Config = {
  count: number
  minCount: number
  maxCount: number
  maxRadius: number
  minRadius: number
  forceRadius: number
  damping: number
  gravityDamping: number
  kinds: string[]
  rules: Record<string, Record<string, number>>
}

export const defaultConfig: Config = {
  count: 2000,
  minCount: 1000,
  maxCount: 10_000,
  maxRadius: 6,
  minRadius: 2,
  forceRadius: 40,
  damping: 0.32,
  gravityDamping: 0.5,
  kinds: ['red', 'green', 'blue'],
  rules: {
    red: {
      red: -0.1,
      green: -0.34,
      blue: 1,
    },
    green: {
      red: -0.17,
      green: -0.34,
      blue: -0.34,
    },
    blue: {
      red: 1,
      green: -0.2,
      blue: 0.15,
    },
  },
}
