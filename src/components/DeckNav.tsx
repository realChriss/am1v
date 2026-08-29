import type { RefObject } from 'react'
import { ChevronIcon } from './icons'

type DeckNavProps = {
  navRef: RefObject<HTMLElement | null>
  atStart: boolean
  atEnd: boolean
  onStep: (step: number) => void
}

export default function DeckNav({ navRef, atStart, atEnd, onStep }: DeckNavProps) {
  return (
    <nav className="am-nav" ref={navRef} aria-label="Pages">
      <button
        type="button"
        className="am-step am-step-up"
        onClick={() => onStep(-1)}
        disabled={atStart}
        aria-label="Previous page"
      >
        <ChevronIcon />
      </button>

      <button
        type="button"
        className="am-step am-step-down"
        onClick={() => onStep(1)}
        disabled={atEnd}
        aria-label="Next page"
      >
        <ChevronIcon />
      </button>
    </nav>
  )
}
