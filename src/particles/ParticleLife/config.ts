export type Config = {
  count: number
  bgColor: string
  minCount: number
  maxCount: number
  maxRadius: number
  minRadius: number
  forceRadius: number
  damping: number
  gravityForce: number
  retractionForce: number
  rules: Record<string, Record<string, number>>
}

export const defaultConfig: Config = {
  count: 2000,
  bgColor: 'rgba(0, 0, 0, 0.03)',
  minCount: 1000,
  maxCount: 10_000,
  maxRadius: 6,
  minRadius: 6,
  forceRadius: 40,
  damping: 0.32,
  gravityForce: 0.5,
  retractionForce: 2.0,
  rules: {
    red: {
      color: 0xff0000ff,
      red: -0.1,
      green: -0.34,
      blue: 1,
      yellow: -0.2,
    },
    green: {
      color: 0x00ff00ff,
      red: -0.17,
      green: -0.34,
      blue: -0.34,
      yellow: -0.4,
    },
    blue: {
      color: 0x0000ffff,
      red: 1,
      green: -0.2,
      blue: 0.15,
      yellow: -0.2,
    },
    yellow: {
      color: 0xffff00ff,
      red: 0.2,
      green: 0.2,
      blue: -0.2,
      yellow: -0.2,
    },
  },
}
