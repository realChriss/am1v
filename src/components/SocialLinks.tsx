import type { CSSProperties } from 'react'
import { SYMBOLS } from '../content'

export default function SocialLinks() {
  return (
    <nav className="am-symbols" aria-label="Elsewhere">
      {SYMBOLS.map(({ name, href, Icon }, i) => (
        <a
          key={name}
          className="am-symbol am-tick-frame am-glass"
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
  )
}
