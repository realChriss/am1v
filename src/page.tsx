import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react'
import './app.css'
import { startField } from './field'
import {
  ArrowUpRightIcon,
  BitcoinIcon,
  ChevronIcon,
  E2ShareIcon,
  GithubIcon,
  PlasmerIcon,
  VexWaveIcon,
} from './icons'

const SYMBOLS = [
  { name: 'GitHub', href: 'https://github.com/realChriss', Icon: GithubIcon },
  {
    name: 'Bitcoin',
    href: 'https://3xpl.com/bitcoin/address/bc1qtdcvpw5y5y5m5hy6ye05ha3a245eg9rzfdk77e',
    Icon: BitcoinIcon,
  },
]

const PROJECTS = [
  {
    name: 'VexWave',
    blurb: 'A desktop music player for your own server',
    href: 'https://vexwave.github.io/',
    Icon: VexWaveIcon,
  },
  {
    name: 'e2share',
    blurb: 'End-to-end encrypted file sharing',
    href: 'https://e2share.net/',
    Icon: E2ShareIcon,
  },
  {
    name: 'Plasmer',
    blurb: 'A precision macro built for speed',
    href: 'https://plasmer.top/',
    Icon: PlasmerIcon,
  },
]

const SLIDES = 2
const FONT_WAIT_MS = 900
const GLITCH_MS = 760
const GLITCH_STEP_MS = 42
const WHEEL_GAP_MS = 400
const READY_MAX_MS = 3400
const MARK_FONT = '900 100px Archivo'
const GATE_TEXT = 'enter...'
const MARK_TEXT = 'am1v'
const GLYPHS = '@#%&$*+=<>[]{}/|01am1v.?!~^'

type Phase = 'hold' | 'gate' | 'glitch' | 'intro' | 'ready'

const lockTimes = (slots: number, keep: number) =>
  Array.from({ length: slots }, (_, i) =>
    i >= keep
      ? 0.08 + ((i - keep) / (slots - keep)) * 0.2 + Math.random() * 0.05
      : 0.44 + (i / keep) * 0.3 + Math.random() * 0.12,
  )

export default function Page() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const stackRef = useRef<HTMLElement>(null)
  const markRef = useRef<HTMLDivElement>(null)
  const faceRef = useRef<HTMLSpanElement>(null)
  const navRef = useRef<HTMLElement>(null)
  const resets = useRef(0)
  const [fieldKey, setFieldKey] = useState(0)
  const [litKey, setLitKey] = useState(-1)
  const [phase, setPhase] = useState<Phase>('hold')
  const [face, setFace] = useState(GATE_TEXT)
  const [slide, setSlide] = useState(0)
  const [moved, setMoved] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    return startField(
      canvas,
      () => {
        if (resets.current >= 3) return
        resets.current += 1
        setFieldKey((k) => k + 1)
      },
      () => setLitKey(fieldKey),
    )
  }, [fieldKey])

  const measure = () => {
    const stack = stackRef.current
    const mark = markRef.current
    if (!stack || !mark) return
    const lift = (stack.offsetHeight - mark.offsetHeight) / 2
    stack.style.setProperty('--intro-lift', `${lift}px`)
  }

  useEffect(() => {
    let done = false
    let raf = 0

    const open = () => {
      if (done) return
      done = true
      measure()
      raf = requestAnimationFrame(() => setPhase('gate'))
    }

    const timer = window.setTimeout(open, FONT_WAIT_MS)
    void document.fonts.load(MARK_FONT, 'am1v enter.').then(open, () => {})

    return () => {
      done = true
      window.clearTimeout(timer)
      cancelAnimationFrame(raf)
    }
  }, [])

  useEffect(() => {
    if (phase === 'intro' || phase === 'ready') return
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [phase])

  const start = useCallback(() => {
    if (phase !== 'gate') return
    measure()

    const el = faceRef.current
    if (el) el.style.setProperty('--gate-opacity', getComputedStyle(el).opacity)

    setPhase('glitch')
  }, [phase])

  useEffect(() => {
    if (phase !== 'gate') return

    const press = (event: KeyboardEvent) => {
      if (event.altKey || event.ctrlKey || event.metaKey) return
      start()
    }

    window.addEventListener('keydown', press)
    window.addEventListener('wheel', start, { passive: true })
    return () => {
      window.removeEventListener('keydown', press)
      window.removeEventListener('wheel', start)
    }
  }, [phase, start])

  useEffect(() => {
    if (phase !== 'glitch') return

    const slots = Math.max(GATE_TEXT.length, MARK_TEXT.length)
    const locks = lockTimes(slots, MARK_TEXT.length)
    const began = performance.now()
    let painted = -Infinity
    let raf = 0

    const tick = (now: number) => {
      const t = Math.min(1, (now - began) / GLITCH_MS)

      if (t >= 1) {
        setFace(MARK_TEXT)
        setPhase('intro')
        return
      }

      if (now - painted >= GLITCH_STEP_MS) {
        painted = now
        let out = ''
        for (let i = 0; i < slots; i++) {
          out += t >= locks[i] ? (MARK_TEXT[i] ?? '') : GLYPHS[(Math.random() * GLYPHS.length) | 0]
        }
        setFace(out)
      }

      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [phase])

  useEffect(() => {
    const mark = markRef.current
    if (phase !== 'intro' || !mark) return

    const clear = (event: AnimationEvent) => {
      if (event.target !== mark) return
      mark.style.willChange = 'auto'
    }
    mark.addEventListener('animationend', clear)
    return () => mark.removeEventListener('animationend', clear)
  }, [phase])

  useEffect(() => {
    const nav = navRef.current
    if (phase !== 'intro' || !nav) return

    const done = (event: AnimationEvent) => {
      if (event.target !== nav) return
      setPhase('ready')
    }

    const timer = window.setTimeout(() => setPhase('ready'), READY_MAX_MS)

    nav.addEventListener('animationend', done)
    nav.addEventListener('animationcancel', done)
    return () => {
      window.clearTimeout(timer)
      nav.removeEventListener('animationend', done)
      nav.removeEventListener('animationcancel', done)
    }
  }, [phase])

  const go = (step: number) => {
    setMoved(true)
    setSlide((s) => Math.min(SLIDES - 1, Math.max(0, s + step)))
  }

  useEffect(() => {
    if (phase !== 'ready') return

    const onKey = (event: KeyboardEvent) => {
      if (event.altKey || event.ctrlKey || event.metaKey) return

      const step =
        event.key === 'ArrowDown' || event.key === 'PageDown'
          ? 1
          : event.key === 'ArrowUp' || event.key === 'PageUp'
            ? -1
            : 0

      if (step) go(step)
      else if (event.key === 'Home' || event.key === 'End') {
        setMoved(true)
        setSlide(event.key === 'Home' ? 0 : SLIDES - 1)
      } else return

      event.preventDefault()
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [phase])

  useEffect(() => {
    if (phase !== 'ready') return
    let last = 0

    const onWheel = (event: WheelEvent) => {
      const now = Date.now()
      const gap = now - last
      last = now
      if (gap >= WHEEL_GAP_MS && Math.abs(event.deltaY) > Math.abs(event.deltaX)) {
        go(event.deltaY > 0 ? 1 : -1)
      }
    }

    window.addEventListener('wheel', onWheel, { passive: true })
    return () => window.removeEventListener('wheel', onWheel)
  }, [phase])

  const lit = litKey === fieldKey
  const revealed = phase === 'intro' || phase === 'ready'
  const marked = revealed || phase === 'glitch'

  const flags = [
    phase === 'hold' && 'is-hold',
    phase === 'gate' && 'is-gate',
    phase === 'glitch' && 'is-glitch',
    marked && 'is-mark',
    revealed && 'is-intro',
    lit && 'is-lit',
    moved && 'is-moved',
  ]

  return (
    <div className={['am-page', ...flags.filter(Boolean)].join(' ')}>
      <canvas key={fieldKey} ref={canvasRef} className="am-field" aria-hidden="true" />
      <div className="am-scrim" aria-hidden="true" />

      <div className="am-track" style={{ '--slide': slide } as CSSProperties}>
        <section className="am-hero" inert={slide !== 0}>
          <main className="am-stack" ref={stackRef}>
            <div className="am-mark-lift" ref={markRef}>
              <h1 className="am-mark">
                <span className="am-quiet">{MARK_TEXT}</span>
                <span className="am-mark-face" ref={faceRef} data-text={face} aria-hidden="true">
                  {face}
                </span>
              </h1>
            </div>

            <p className="am-role">Web Developer &amp; Software Enthusiast</p>
            <p className="am-meta">21 &middot; Germany</p>

            <nav className="am-symbols" aria-label="Elsewhere">
              {SYMBOLS.map(({ name, href, Icon }, i) => (
                <a
                  key={name}
                  className="am-symbol am-tick-frame"
                  style={{ '--i': i } as CSSProperties}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={name}
                >
                  <span className="am-ticks" aria-hidden="true" />
                  <Icon />
                </a>
              ))}
            </nav>
          </main>
        </section>

        <section
          className={`am-work${slide > 0 ? ' is-shown' : ''}`}
          aria-labelledby="am-work-title"
          inert={slide === 0}
        >
          <div className="am-work-inner">
            <h2 className="am-work-title" id="am-work-title">
              Projects
            </h2>

            <ul className="am-projects">
              {PROJECTS.map(({ name, blurb, href, Icon }, i) => (
                <li
                  key={name}
                  className="am-project"
                  style={{ '--i': i } as CSSProperties}
                >
                  <a
                    className="am-project-link am-tick-frame"
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <span className="am-ticks" aria-hidden="true" />
                    <span className="am-project-glyph" aria-hidden="true">
                      <Icon />
                    </span>
                    <span className="am-project-body">
                      <span className="am-project-name">{name}</span>
                      <span className="am-project-blurb">{blurb}</span>
                    </span>
                    <ArrowUpRightIcon className="am-project-arrow" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>

      <nav className="am-nav" ref={navRef} aria-label="Pages">
        <button
          type="button"
          className="am-step am-step-up"
          onClick={() => go(-1)}
          disabled={slide === 0}
          aria-label="Previous page"
        >
          <ChevronIcon />
        </button>

        <button
          type="button"
          className="am-step am-step-down"
          onClick={() => go(1)}
          disabled={slide === SLIDES - 1}
          aria-label="Next page"
        >
          <ChevronIcon />
        </button>
      </nav>

      {phase === 'gate' && (
        <button
          type="button"
          className="am-gate"
          onPointerDown={start}
          onClick={start}
          aria-label="Enter"
        />
      )}
    </div>
  )
}
