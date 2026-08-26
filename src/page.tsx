import { useEffect, useRef, useState } from 'react'
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

export default function Page() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const resets = useRef(0)
  const [fieldKey, setFieldKey] = useState(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    // a lost context cannot be re-acquired from the same element, so
    // remount the canvas to get a fresh one
    return startChromeField(canvas, () => {
      if (resets.current >= 3) return
      resets.current += 1
      setFieldKey((k) => k + 1)
    })
  }, [fieldKey])

  return (
    <div className="am-page">
      <canvas key={fieldKey} ref={canvasRef} className="am-field" aria-hidden="true" />
      <div className="am-scrim" aria-hidden="true" />

      <main className="am-stack">
        <div className="am-mark-base" aria-hidden="true">
          am1v
        </div>
        <h1 className="am-mark">am1v</h1>

        <p className="am-role">Web Developer &amp; Software Enthusiast</p>
        <p className="am-meta">21 &middot; Germany</p>

        <nav className="am-symbols" aria-label="Elsewhere">
          {SYMBOLS.map(({ name, href, Icon }) => (
            <a
              key={name}
              className="am-symbol"
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
