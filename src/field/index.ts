import { createQuality } from './quality'
import { createRenderer } from './renderer'

const FRAME_MS = 1000 / 60
const SEED_RANGE = 8

export function startField(
  canvas: HTMLCanvasElement,
  onUnrecoverable?: () => void,
  onFirstFrame?: () => void,
): () => void {
  const gl = canvas.getContext('webgl', {
    antialias: false,
    alpha: false,
    powerPreference: 'low-power',
  })

  if (!gl) {
    console.warn('[am1v] no WebGL context; falling back to the CSS field')
    return () => {}
  }

  const seed: readonly [number, number] = [
    Math.random() * SEED_RANGE,
    Math.random() * SEED_RANGE,
  ]

  const quality = createQuality()

  let renderer = createRenderer(gl, seed, quality.scale)
  if (!renderer) return () => {}

  const start = performance.now()
  let frame = 0
  let running = false
  let lastFrame = 0
  let recover = 0
  let announced = false
  let needsResize = true

  const stop = () => {
    running = false
    if (frame) cancelAnimationFrame(frame)
    frame = 0
  }

  const loop = (now: number) => {
    if (!running || !renderer) return
    frame = requestAnimationFrame(loop)
    if (now - lastFrame < FRAME_MS - 1) return
    const delta = lastFrame ? now - lastFrame : 0
    lastFrame = now
    if (needsResize) {
      needsResize = false
      renderer.resize()
    }
    renderer.draw((now - start) / 1000)
    if (delta && quality.record(delta)) needsResize = true
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
    quality.reset()
    frame = requestAnimationFrame(loop)
  }

  const onLost = (event: Event) => {
    event.preventDefault()
    stop()
    renderer = null
    console.warn('[am1v] background field context lost')
  }

  const onRestored = () => {
    window.clearTimeout(recover)
    renderer = createRenderer(gl, seed, quality.scale)
    if (!renderer) {
      onUnrecoverable?.()
      return
    }
    needsResize = true
    run()
  }

  const revive = () => {
    if (!gl.isContextLost()) return
    try {
      gl.getExtension('WEBGL_lose_context')?.restoreContext()
    } catch {}
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

  const onResize = () => {
    needsResize = true
  }

  canvas.addEventListener('webglcontextlost', onLost)
  canvas.addEventListener('webglcontextrestored', onRestored)
  document.addEventListener('visibilitychange', onVisibility)
  window.addEventListener('pageshow', onPageShow)
  window.addEventListener('resize', onResize)
  window.addEventListener('orientationchange', onResize)

  run()

  return () => {
    stop()
    window.clearTimeout(recover)
    canvas.removeEventListener('webglcontextlost', onLost)
    canvas.removeEventListener('webglcontextrestored', onRestored)
    document.removeEventListener('visibilitychange', onVisibility)
    window.removeEventListener('pageshow', onPageShow)
    window.removeEventListener('resize', onResize)
    window.removeEventListener('orientationchange', onResize)
    if (!gl.isContextLost()) renderer?.release()
  }
}
