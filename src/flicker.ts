type Tempo = 'fast' | 'med' | 'slow'

interface Burst {
  cuts: number
  tempo: Tempo
  gapMs: number
}

const TEMPO: Record<Tempo, { dimMs: number; darkMs: number; litMs: number }> = {
  fast: { dimMs: 260, darkMs: 40, litMs: 50 },
  med: { dimMs: 320, darkMs: 60, litMs: 75 },
  slow: { dimMs: 380, darkMs: 85, litMs: 105 },
}

const BURSTS: Burst[] = [
  { cuts: 2, tempo: 'fast', gapMs: 3400 },
  { cuts: 1, tempo: 'fast', gapMs: 3900 },
  { cuts: 5, tempo: 'med', gapMs: 4300 },
  { cuts: 3, tempo: 'fast', gapMs: 3300 },
  { cuts: 2, tempo: 'slow', gapMs: 3800 },
  { cuts: 4, tempo: 'fast', gapMs: 4100 },
]

const DIM_PER_CUT_MS = 45
const OPENING_MS = 1000
const SAG_HOLD_MS = 70
const STEP = 'steps(1, end)'
const BASE_SHADOW = 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.55))'

interface State {
  opacity: number
  stroke: number
  glow: [px: number, alpha: number]
  fringePx?: number
  shiftPx?: number
  skewDeg?: number
}

// fringes first so they copy the glyph rather than the bloom, and all four
// functions are always present so one filter can interpolate into the next
const filterFor = (s: State) => {
  const fringe = s.fringePx ?? 0
  const alpha = fringe > 0 ? 0.7 : 0
  return (
    `drop-shadow(${-fringe}px 0 0 rgba(75, 225, 255, ${alpha})) ` +
    `drop-shadow(${fringe}px 0 0 rgba(255, 46, 106, ${alpha})) ` +
    `drop-shadow(0 0 ${s.glow[0]}px rgba(198, 226, 255, ${s.glow[1]})) ` +
    BASE_SHADOW
  )
}

const transformFor = (s: State) =>
  `translateX(${s.shiftPx ?? 0}px) skewX(${s.skewDeg ?? 0}deg)`

// keep in step with the resting .am-mark in app.css
const LIT: State = { opacity: 1, stroke: 0.85, glow: [24, 0.3] }
const SAG: State = { opacity: 0.82, stroke: 0.3, glow: [3, 0.04] }
const DARK: State = { opacity: 0, stroke: 0.1, glow: [0, 0] }
const BREATH: State = { opacity: 1, stroke: 0.9, glow: [28, 0.36] }

const flash = (cuts: number, index: number): State => {
  const dir = index % 2 === 0 ? 1 : -1
  return {
    opacity: 1,
    stroke: 0.92,
    glow: [28, 0.4],
    fringePx: 1.6 + 0.3 * cuts,
    shiftPx: dir * (2 + 0.4 * cuts),
    skewDeg: dir * -0.9,
  }
}

const strike = (cuts: number): State => ({
  opacity: 1,
  stroke: 0.98,
  glow: [30 + 2 * cuts, 0.4 + 0.03 * cuts],
  fringePx: 0.5 + 0.2 * cuts,
})

const settleMs = (cuts: number) => 450 + 60 * cuts

const frame = (s: State, easing: string): Keyframe => ({
  opacity: s.opacity,
  webkitTextStrokeColor: `rgba(255, 255, 255, ${s.stroke})`,
  filter: filterFor(s),
  transform: transformFor(s),
  easing,
})

function compose(burst: Burst, openingMs: number) {
  const { dimMs, darkMs, litMs } = TEMPO[burst.tempo]
  const sagMs = dimMs + DIM_PER_CUT_MS * burst.cuts
  const marks: { at: number; kf: Keyframe }[] = []
  let at = 0

  const add = (state: State, easing: string, advance: number) => {
    marks.push({ at, kf: frame(state, easing) })
    at += advance
  }

  if (openingMs > 0) add(LIT, 'linear', openingMs)
  add(LIT, 'ease-in-out', sagMs)
  add(SAG, STEP, SAG_HOLD_MS)
  for (let i = 0; i < burst.cuts; i++) {
    add(DARK, STEP, darkMs)
    if (i < burst.cuts - 1) add(flash(burst.cuts, i), STEP, litMs)
  }
  add(strike(burst.cuts), 'ease-out', settleMs(burst.cuts))
  add(LIT, 'ease-in-out', burst.gapMs / 2)
  add(BREATH, 'ease-in-out', burst.gapMs / 2)

  const duration = at
  marks.push({ at: duration, kf: frame(LIT, 'linear') })

  return {
    duration,
    keyframes: marks.map(({ at: t, kf }) => ({ ...kf, offset: t / duration })),
  }
}

function queueOf(previous?: Burst): Burst[] {
  const next = [...BURSTS]
  for (let i = next.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[next[i], next[j]] = [next[j], next[i]]
  }
  if (previous && next[0] === previous) [next[0], next[1]] = [next[1], next[0]]
  return next
}

export function startFlicker(mark: HTMLElement): () => void {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
  let running = false
  let current: Animation | null = null
  let queue: Burst[] = []
  let previous: Burst | undefined

  const play = (openingMs: number) => {
    if (!running) return
    if (queue.length === 0) queue = queueOf(previous)
    const burst = queue.shift() as Burst
    previous = burst

    const { keyframes, duration } = compose(burst, openingMs)
    const animation = mark.animate(keyframes, { duration, fill: 'none' })
    current = animation
    animation.finished
      .then(() => {
        if (running && current === animation) play(0)
      })
      .catch(() => undefined)
  }

  const stop = () => {
    running = false
    current?.cancel()
    current = null
  }

  const start = () => {
    if (running || reduced.matches) return
    running = true
    queue = []
    previous = undefined
    play(OPENING_MS)
  }

  const onPreferenceChange = () => (reduced.matches ? stop() : start())
  reduced.addEventListener('change', onPreferenceChange)
  start()

  return () => {
    stop()
    reduced.removeEventListener('change', onPreferenceChange)
  }
}
