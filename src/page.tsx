import { useEffect, useRef, useState, type CSSProperties } from 'react'
import './app.css'
import { startChromeField } from './field'
import { BitcoinIcon, GithubIcon } from './icons'

const SYMBOLS = [
  { name: 'GitHub', href: 'https://github.com/realChriss', Icon: GithubIcon },
  {
    name: 'Bitcoin',
    href: 'https://3xpl.com/bitcoin/address/bc1qtdcvpw5y5y5m5hy6ye05ha3a245eg9rzfdk77e',
    Icon: BitcoinIcon,
  },
]

const INTRO_WAIT_MS = 900

export default function Page() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const stackRef = useRef<HTMLElement>(null)
  const markRef = useRef<HTMLDivElement>(null)
  const resets = useRef(0)
  const [fieldKey, setFieldKey] = useState(0)
  const [litKey, setLitKey] = useState(-1)
  const [intro, setIntro] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    // a lost context cannot be re-acquired from the same element
    return startChromeField(
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

    const begin = () => {
      if (done) return
      done = true
      const stack = stackRef.current
      const mark = markRef.current
      if (stack && mark) {
        const lift = (stack.offsetHeight - mark.offsetHeight) / 2
        stack.style.setProperty('--intro-lift', `${lift}px`)
      }
      setIntro(true)
    }

    const timer = window.setTimeout(begin, INTRO_WAIT_MS)
    void document.fonts.ready.then(begin)

    return () => {
      done = true
      window.clearTimeout(timer)
    }
  }, [])

  const lit = litKey === fieldKey

  return (
    <div
      className={`am-page${intro ? ' is-intro' : ''}${lit ? ' is-lit' : ''}`}
    >
      <canvas key={fieldKey} ref={canvasRef} className="am-field" aria-hidden="true" />
      <div className="am-scrim" aria-hidden="true" />

      <main className="am-stack" ref={stackRef}>
        <div className="am-mark-base" ref={markRef} aria-hidden="true">
          am1v
        </div>
        <h1 className="am-mark">am1v</h1>

        <p className="am-role">Web Developer &amp; Software Enthusiast</p>
        <p className="am-meta">21 &middot; Germany</p>

        <nav className="am-symbols" aria-label="Elsewhere">
          {SYMBOLS.map(({ name, href, Icon }, i) => (
            <a
              key={name}
              className="am-symbol"
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
    </div>
  )
}
