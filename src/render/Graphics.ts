export type Color = number

type Common = {
  color: Color
  strokeWidth: number
  strokeColor: Color
  visible: boolean
}

export type Circle = {
  type: 'circle'
  radius: number
  x: number
  y: number
} & Common

export type Rectangle = {
  type: 'rectangle'
  width: number
  height: number
  x: number
  y: number
} & Common

export type Line = {
  type: 'line'
  x1: number
  y1: number
  x2: number
  y2: number
} & Common

export type Graphics = Circle | Rectangle | Line
