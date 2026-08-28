import { useEffect, useRef, useState, type CSSProperties } from 'react'
import './app.css'
import { startField } from './field'
import {
  ArrowUpRightIcon,
  BitcoinIcon,
  ChevronIcon,
  GithubIcon,
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
]

const SLIDES = 2
const INTRO_WAIT_MS = 900
const MARK_FONT = '900 100px Archivo'

export default function Page() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const stackRef = useRef<HTMLElement>(null)
  const markRef = useRef<HTMLDivElement>(null)
  const resets = useRef(0)
  const [fieldKey, setFieldKey] = useState(0)
  const [litKey, setLitKey] = useState(-1)
  const [intro, setIntro] = useState(false)
  const [slide, setSlide] = useState(0)
  // the nav pings until it has been used once, then never again
  const [moved, setMoved] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    // a lost context cannot be re-acquired from the same element
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

  useEffect(() => {
    let done = false
    let raf = 0

    const begin = () => {
      if (done) return
      done = true
      const stack = stackRef.current
      const mark = markRef.current
      if (stack && mark) {
        const lift = (stack.offsetHeight - mark.offsetHeight) / 2
        stack.style.setProperty('--intro-lift', `${lift}px`)
      }

      raf = requestAnimationFrame(() => setIntro(true))
    }

    const timer = window.setTimeout(begin, INTRO_WAIT_MS)
    void document.fonts.load(MARK_FONT, 'am1v').then(begin, () => {})

    return () => {
      done = true
      window.clearTimeout(timer)
      cancelAnimationFrame(raf)
    }
  }, [])

  useEffect(() => {
    const mark = markRef.current
    if (!intro || !mark) return

    const clear = (event: AnimationEvent) => {
      if (event.target !== mark) return
      mark.style.willChange = 'auto'
      mark.removeEventListener('animationend', clear)
    }
    mark.addEventListener('animationend', clear)
    return () => mark.removeEventListener('animationend', clear)
  }, [intro])

  const go = (step: number) => {
    setMoved(true)
    setSlide((s) => Math.min(SLIDES - 1, Math.max(0, s + step)))
  }

  // native scrolling is off, so the keyboard needs its own way through the deck
  useEffect(() => {
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
  }, [])

  const lit = litKey === fieldKey

  return (
    <div
      className={`am-page${intro ? ' is-intro' : ''}${lit ? ' is-lit' : ''}${
        moved ? ' is-moved' : ''
      }`}
    >
      <canvas key={fieldKey} ref={canvasRef} className="am-field" aria-hidden="true" />
      <div className="am-scrim" aria-hidden="true" />

      <div className="am-track" style={{ '--slide': slide } as CSSProperties}>
        <section className="am-hero" inert={slide !== 0}>
          <main className="am-stack" ref={stackRef}>
            <div className="am-mark-lift" ref={markRef}>
              <h1 className="am-mark">
                <span className="am-mark-face">am1v</span>
                <span className="am-mark-wipe" aria-hidden="true">
                  <span className="am-mark-veil" />
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

      <nav className="am-nav" aria-label="Pages">
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
    </div>
  )
}
