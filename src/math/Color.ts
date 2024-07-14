import { Color } from '../render/Graphics'

export function colorToRGBA(color: Color): string {
  const r = (color >> 24) & 0xff
  const g = (color >> 16) & 0xff
  const b = (color >> 8) & 0xff
  const a = (color & 0xff) / 0xff

  return `rgba(${r}, ${g}, ${b}, ${a})`
}

export function createColor(r: number, g: number, b: number, a: number): Color {
  return (
    ((r & 0xff) << 24) |
    ((g & 0xff) << 16) |
    ((b & 0xff) << 8) |
    ((a * 0xff) & 0xff)
  )
}
