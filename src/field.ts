const VERT = `
attribute vec2 a;
void main() { gl_Position = vec4(a, 0.0, 1.0); }
`

const FRAG = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform vec2 u_res;
uniform float u_time;
uniform vec2 u_seed;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

vec2 hash2(vec2 p) {
  return fract(sin(vec2(dot(p, vec2(127.1, 311.7)),
                        dot(p, vec2(269.5, 183.3)))) * 43758.5453);
}

float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}

float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
  for (int i = 0; i < 3; i++) {
    v += a * noise(p + u_seed);
    p = m * p;
    a *= 0.5;
  }
  return v;
}

float rainLayer(vec2 uv, float t, float cols, float speed, float len, float lean, float density) {
  vec2 p = vec2(uv.x * cols + uv.y * lean, uv.y);
  float id = floor(p.x);
  vec2 r = hash2(vec2(id, 3.7));
  if (hash(vec2(id, 11.3)) > density) return 0.0;

  float fall = p.y * (1.7 + 1.1 * hash(vec2(id, 5.1)))
             + t * speed * (0.7 + r.x) + r.y;
  float cycle = floor(fall);
  float y = fract(fall);

  vec2 q = hash2(vec2(id, cycle));
  float x = fract(p.x) - 0.5 + (q.x - 0.5) * 0.82;
  float streak = smoothstep(len * (0.65 + 0.80 * q.y), 0.0, y)
               * smoothstep(0.075, 0.0, abs(x));
  return streak * (0.25 + 0.75 * q.y);
}

void main() {
  vec2 res = max(u_res, vec2(1.0));
  vec2 uv = (gl_FragCoord.xy - 0.5 * res) / res.y;
  vec2 o = uv + u_seed;
  float t = u_time;

  float rain = rainLayer(o,         t, 13.0, 3.60, 0.45, 1.6, 0.55) * 0.46
             + rainLayer(o +  7.0,  t, 21.0, 2.60, 0.36, 1.9, 0.46) * 0.26
             + rainLayer(o + 19.0,  t, 33.0, 1.85, 0.28, 2.2, 0.40) * 0.15;

  float haze = fbm(uv * 0.9 + vec2(0.0, t * 0.02)) * 0.05;
  float col = 0.018 + haze + rain;

  float d = length(uv * vec2(1.0, 1.25));
  col *= mix(0.52, 1.0, smoothstep(0.1, 1.1, d));
  col *= 1.0 - 0.42 * smoothstep(0.75, 1.7, d);

  col += (hash(gl_FragCoord.xy + u_time) - 0.5) * 0.011;

  gl_FragColor = vec4(vec3(max(col, 0.0)), 1.0);
}
`

const SCALE = 0.55
const MAX_PIXELS = 1300000
const FRAME_MS = 1000 / 60
const SEED_RANGE = 8

type Renderer = {
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

function createRenderer(
  gl: WebGLRenderingContext,
  seed: readonly [number, number],
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
      let w = Math.max(1, Math.round(window.innerWidth * dpr * SCALE))
      let h = Math.max(1, Math.round(window.innerHeight * dpr * SCALE))
      const over = (w * h) / MAX_PIXELS
      if (over > 1) {
        const k = Math.sqrt(over)
        w = Math.max(1, Math.round(w / k))
        h = Math.max(1, Math.round(h / k))
      }
      // mobile URL bars resize innerHeight constantly; stretching is cheaper
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

export function startField(
  canvas: HTMLCanvasElement,
  onUnrecoverable?: () => void,
  onFirstFrame?: () => void,
): () => void {
  const gl = (canvas.getContext('webgl', {
    antialias: false,
    alpha: false,
    powerPreference: 'low-power',
  }) ?? canvas.getContext('experimental-webgl')) as WebGLRenderingContext | null

  if (!gl) {
    console.warn('[am1v] no WebGL context; falling back to the CSS field')
    return () => {}
  }

  const seed: readonly [number, number] = [
    Math.random() * SEED_RANGE,
    Math.random() * SEED_RANGE,
  ]

  let renderer = createRenderer(gl, seed)
  if (!renderer) return () => {}

  const start = performance.now()
  let frame = 0
  let running = false
  let lastFrame = 0
  let recover = 0
  let announced = false

  const stop = () => {
    running = false
    if (frame) cancelAnimationFrame(frame)
    frame = 0
  }

  const loop = (now: number) => {
    if (!running || !renderer) return
    frame = requestAnimationFrame(loop)
    if (now - lastFrame < FRAME_MS - 1) return
    lastFrame = now
    renderer.resize()
    renderer.draw((now - start) / 1000)
    if (!announced) {
      announced = true
      onFirstFrame?.()
    }
  }

  const run = () => {
    if (!renderer || gl.isContextLost() || document.hidden) return
    if (running) return
    running = true
    lastFrame = 0
    frame = requestAnimationFrame(loop)
  }

  const onLost = (event: Event) => {
    // only a cancelled loss event gets restored
    event.preventDefault()
    stop()
    renderer = null
    console.warn('[am1v] background field context lost')
  }

  const onRestored = () => {
    window.clearTimeout(recover)
    renderer = createRenderer(gl, seed)
    if (!renderer) {
      onUnrecoverable?.()
      return
    }
    run()
  }

  // Safari drops the context when backgrounded and often never fires restored
  const revive = () => {
    if (!gl.isContextLost()) return
    try {
      gl.getExtension('WEBGL_lose_context')?.restoreContext()
    } catch {
      /* throws unless the loss came from loseContext() */
    }
    window.clearTimeout(recover)
    recover = window.setTimeout(() => {
      if (gl.isContextLost()) onUnrecoverable?.()
    }, 1500)
  }

  const onVisibility = () => {
    if (document.hidden) {
      stop()
      return
    }
    revive()
    run()
  }

  const onPageShow = () => {
    revive()
    run()
  }

  canvas.addEventListener('webglcontextlost', onLost)
  canvas.addEventListener('webglcontextrestored', onRestored)
  document.addEventListener('visibilitychange', onVisibility)
  window.addEventListener('pageshow', onPageShow)

  run()

  return () => {
    stop()
    window.clearTimeout(recover)
    canvas.removeEventListener('webglcontextlost', onLost)
    canvas.removeEventListener('webglcontextrestored', onRestored)
    document.removeEventListener('visibilitychange', onVisibility)
    window.removeEventListener('pageshow', onPageShow)
    if (!gl.isContextLost()) renderer?.release()
  }
}
