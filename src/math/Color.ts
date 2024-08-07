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

export function getRed(color: Color): number {
  return (color >> 24) & 0xff
}

export function getGreen(color: Color): number {
  return (color >> 16) & 0xff
}

export function getBlue(color: Color): number {
  return (color >> 8) & 0xff
}

export function getAlpha(color: Color): number {
  return color & 0xff
}

export function setRed(color: Color, value: number): Color {
  return ((value & 0xff) << 24) | (color & 0x00ffffff)
}

export function setGreen(color: Color, value: number): Color {
  return ((value & 0xff) << 16) | (color & 0xff00ffff)
}

export function setBlue(color: Color, value: number): Color {
  return ((value & 0xff) << 8) | (color & 0xffff00ff)
}

export function setAlpha(color: Color, value: number): Color {
  return (value & 0xff) | (color & 0xffffff00)
}
