import { Rect } from '../math/Rect'
import { Storage } from '../storage/Storage'
import { Graphics } from './Graphics'
import { RenderConfig, RenderItem } from './Render'
import { getAlpha, getBlue, getGreen, getRed } from '../math/Color'

import shapeVertexShaderSrc from './webgl/shape.vert'
import circleFragmentShaderSrc from './webgl/circle.frag'
import rectangleFragmentShaderSrc from './webgl/rectangle.frag'
import lineFragmentShaderSrc from './webgl/line.frag'
import lineVertexShaderSrc from './webgl/line.vert'

export class WebGLRender {
  private gl: WebGLRenderingContext
  private viewport: Rect
  private programs: Map<Graphics['type'], WebGLProgram> = new Map()

  constructor(
    canvas: HTMLCanvasElement,
    private storage: Storage<RenderItem>,
    private config: RenderConfig,
  ) {
    const gl = canvas.getContext('webgl2', {
      alpha: false,
    })
    if (!gl) {
      throw new Error('WebGL2 context is not supported')
    }
    this.gl = gl
    this.viewport = {
      x: 0,
      y: 0,
      width: config.vpWidth,
      height: config.vpHeight,
    }
    const shapeVertexShader = this.createShader(
      gl.VERTEX_SHADER,
      shapeVertexShaderSrc,
    )
    const circleFragmentShader = this.createShader(
      gl.FRAGMENT_SHADER,
      circleFragmentShaderSrc,
    )
    const circleProgram = this.createProgram(
      shapeVertexShader,
      circleFragmentShader,
    )
    this.programs.set('circle', circleProgram)

    const rectangleFragmentShader = this.createShader(
      gl.FRAGMENT_SHADER,
      rectangleFragmentShaderSrc,
    )
    const rectangleProgram = this.createProgram(
      shapeVertexShader,
      rectangleFragmentShader,
    )
    this.programs.set('rectangle', rectangleProgram)

    const lineVertexShader = this.createShader(
      gl.VERTEX_SHADER,
      lineVertexShaderSrc,
    )
    const lineFragmentShader = this.createShader(
      gl.FRAGMENT_SHADER,
      lineFragmentShaderSrc,
    )
    const lineProgram = this.createProgram(lineVertexShader, lineFragmentShader)
    this.programs.set('line', lineProgram)

    const positionBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)

    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
    gl.enable(gl.BLEND)

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)
  }

  updateConfig(config: Partial<RenderConfig>) {
    Object.assign(this.config, config)

    this.viewport.width = this.config.vpWidth
    this.viewport.height = this.config.vpHeight
  }

  tick() {
    this.gl.clearColor(0, 0, 0, 1)
    if (this.config.bgColor) {
      //update clear color
    }
    this.gl.clear(this.gl.COLOR_BUFFER_BIT)

    for (const particle of this.storage) {
      this.render(particle.graphics)
    }
  }

  private render(graphics: Graphics[]) {
    for (const graphic of graphics) {
      if (!graphic.visible) {
        continue
      }

      let program: WebGLProgram
      let verticesCount: number
      let setSpecificUniforms: () => void
      let setShapeFunction: () => void
      let translation: [number, number]
      let scale: [number, number]
      const rotation: [number, number] = [Math.sin(0), Math.cos(0)]
      const origin: [number, number] = [0, 0]

      switch (graphic.type) {
        case 'circle': {
          program = this.programs.get('circle')!
          translation = [graphic.x, graphic.y]
          scale = [graphic.radius * 2, graphic.radius * 2]
          origin[0] = 0.5
          origin[1] = 0.5

          setSpecificUniforms = () => {
            const uCenterLocation = this.gl.getUniformLocation(
              program,
              'u_center',
            )
            const uRadiusLocation = this.gl.getUniformLocation(
              program,
              'u_radius',
            )
            this.gl.uniform2f(uCenterLocation, graphic.x, graphic.y)
            this.gl.uniform1f(uRadiusLocation, graphic.radius)

            this.setScaleAndRotationUniforms(program, scale, rotation)
          }

          setShapeFunction = () => {
            this.gl.bufferData(
              this.gl.ARRAY_BUFFER,
              new Float32Array([0, 0, 0, 1, 1, 0, 1, 1]),
              this.gl.STATIC_DRAW,
            )
          }
          verticesCount = 4
          break
        }
        case 'rectangle': {
          program = this.programs.get('rectangle')!
          translation = [graphic.x, graphic.y]
          scale = [graphic.width, graphic.height]
          origin[0] = 0
          origin[1] = 0

          setSpecificUniforms = () => {
            const uPositionLocation = this.gl.getUniformLocation(
              program,
              'u_position',
            )
            const uSizeLocation = this.gl.getUniformLocation(program, 'u_size')

            this.gl.uniform2f(uPositionLocation, graphic.x, graphic.y)
            this.gl.uniform2f(uSizeLocation, graphic.width, graphic.height)

            this.setScaleAndRotationUniforms(program, scale, rotation)
          }

          setShapeFunction = () => {
            this.gl.bufferData(
              this.gl.ARRAY_BUFFER,
              new Float32Array([0, 0, 0, 1, 1, 0, 1, 1]),
              this.gl.STATIC_DRAW,
            )
          }
          verticesCount = 4
          break
        }
        case 'line': {
          program = this.programs.get('line')!
          translation = [graphic.x1, graphic.y1]
          origin[0] = 0.5
          origin[1] = 0

          setSpecificUniforms = () => {
            const uEndPositionLocation = this.gl.getUniformLocation(
              program,
              'u_endPosition',
            )
            this.gl.uniform2fv(uEndPositionLocation, [graphic.x2, graphic.y2])
          }
          setShapeFunction = () => {
            this.gl.bufferData(
              this.gl.ARRAY_BUFFER,
              new Float32Array([0, 0, 0, 1, 1, 0, 1, 1]),
              this.gl.STATIC_DRAW,
            )
          }
          verticesCount = 4
          break
        }
        default:
          continue
      }

      this.gl.useProgram(program)

      this.setPositionAttribute(program)

      this.setCommonUniforms(program, graphic)

      const translationUniformLocation = this.gl.getUniformLocation(
        program,
        'u_translation',
      )
      this.gl.uniform2fv(translationUniformLocation, translation)

      const originUniformLocation = this.gl.getUniformLocation(
        program,
        'u_origin',
      )
      this.gl.uniform2fv(originUniformLocation, origin)

      setSpecificUniforms()

      setShapeFunction()

      this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, verticesCount)
    }
  }

  private setScaleAndRotationUniforms(
    program: WebGLProgram,
    scale: [number, number],
    rotation: [number, number],
  ) {
    const scaleUniformLocation = this.gl.getUniformLocation(program, 'u_scale')
    this.gl.uniform2fv(scaleUniformLocation, scale)

    const rotationUniformLocation = this.gl.getUniformLocation(
      program,
      'u_rotation',
    )
    this.gl.uniform2fv(rotationUniformLocation, rotation)
  }

  private setPositionAttribute(program: WebGLProgram) {
    const positionAttributeLocation = this.gl.getAttribLocation(
      program,
      'a_position',
    )
    if (positionAttributeLocation === -1) {
      throw new Error('Error getting position attribute location')
    }
    this.gl.enableVertexAttribArray(positionAttributeLocation)
    this.gl.vertexAttribPointer(
      positionAttributeLocation,
      2,
      this.gl.FLOAT,
      false,
      0,
      0,
    )
  }

  private setCommonUniforms(program: WebGLProgram, graphics: Graphics) {
    const resolutionUniformLocation = this.gl.getUniformLocation(
      program,
      'u_resolution',
    )
    this.gl.uniform2f(
      resolutionUniformLocation,
      this.gl.canvas.width,
      this.gl.canvas.height,
    )

    const colorUniformLocation = this.gl.getUniformLocation(program, 'u_color')
    if (colorUniformLocation !== -1) {
      this.gl.uniform4f(
        colorUniformLocation,
        getRed(graphics.color),
        getGreen(graphics.color),
        getBlue(graphics.color),
        getAlpha(graphics.color),
      )
    }

    const strokeWidthUniformLocation = this.gl.getUniformLocation(
      program,
      'u_strokeWidth',
    )
    if (strokeWidthUniformLocation !== -1) {
      this.gl.uniform1f(strokeWidthUniformLocation, graphics.strokeWidth)
    }

    const strokeColorUniformLocation = this.gl.getUniformLocation(
      program,
      'u_strokeColor',
    )
    if (strokeColorUniformLocation !== -1) {
      this.gl.uniform4f(
        strokeColorUniformLocation,
        getRed(graphics.strokeColor),
        getGreen(graphics.strokeColor),
        getBlue(graphics.strokeColor),
        getAlpha(graphics.strokeColor),
      )
    }
  }

  private createShader(type: number, source: string): WebGLShader {
    const shader = this.gl.createShader(type)
    if (!shader) {
      throw new Error('Error creating shader')
    }

    this.gl.shaderSource(shader, source)
    this.gl.compileShader(shader)

    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      throw new Error(
        this.gl.getShaderInfoLog(shader) ?? 'Error compiling shader',
      )
    }

    return shader
  }

  private createProgram(
    vertexShader: WebGLShader,
    fragmentShader: WebGLShader,
  ): WebGLProgram {
    const program = this.gl.createProgram()
    if (!program) {
      throw new Error('Error creating program')
    }
    this.gl.attachShader(program, vertexShader)
    this.gl.attachShader(program, fragmentShader)
    this.gl.linkProgram(program)

    if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
      throw new Error(
        this.gl.getProgramInfoLog(program) ?? 'Error linking program',
      )
    }

    return program
  }
}
