import { FRAG, VERT } from './shaders'

const MAX_PIXELS = 1300000

export type Renderer = {
  resize: () => void
  draw: (seconds: number) => void
  release: () => void
}

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const shader = gl.createShader(type)
  if (!shader) return null
  gl.shaderSource(shader, src)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.warn('[am1v] background field shader failed:', gl.getShaderInfoLog(shader))
    gl.deleteShader(shader)
    return null
  }
  return shader
}

export function createRenderer(
  gl: WebGLRenderingContext,
  seed: readonly [number, number],
  getScale: () => number,
): Renderer | null {
  const vs = compile(gl, gl.VERTEX_SHADER, VERT)
  const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG)
  const program = gl.createProgram()
  if (!vs || !fs || !program) return null

  gl.attachShader(program, vs)
  gl.attachShader(program, fs)
  gl.linkProgram(program)
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.warn('[am1v] background field link failed:', gl.getProgramInfoLog(program))
    return null
  }
  gl.useProgram(program)

  const buffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 3, -1, -1, 3]),
    gl.STATIC_DRAW,
  )
  const loc = gl.getAttribLocation(program, 'a')
  gl.enableVertexAttribArray(loc)
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)

  const uRes = gl.getUniformLocation(program, 'u_res')
  const uTime = gl.getUniformLocation(program, 'u_time')
  gl.uniform2f(gl.getUniformLocation(program, 'u_seed'), seed[0], seed[1])
  const canvas = gl.canvas as HTMLCanvasElement

  let lastW = -1
  let lastH = -1

  return {
    resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const scale = getScale()
      let w = Math.max(1, Math.round(window.innerWidth * dpr * scale))
      let h = Math.max(1, Math.round(window.innerHeight * dpr * scale))
      const over = (w * h) / MAX_PIXELS
      if (over > 1) {
        const k = Math.sqrt(over)
        w = Math.max(1, Math.round(w / k))
        h = Math.max(1, Math.round(h / k))
      }
      if (w === lastW && Math.abs(h - lastH) < lastH * 0.12) return
      lastW = w
      lastH = h
      canvas.width = w
      canvas.height = h
      gl.viewport(0, 0, w, h)
      gl.uniform2f(uRes, w, h)
    },
    draw(seconds: number) {
      gl.uniform1f(uTime, seconds)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
    },
    release() {
      gl.deleteBuffer(buffer)
      gl.deleteProgram(program)
      gl.deleteShader(vs)
      gl.deleteShader(fs)
    },
  }
}
