import type { RefObject } from 'react'
import { MARK_TEXT } from '../content'
import { useGlitchText } from '../hooks/useGlitchText'

type WordmarkProps = {
  faceRef: RefObject<HTMLSpanElement | null>
  glitching: boolean
  onGlitchDone: () => void
}

export default function Wordmark({ faceRef, glitching, onGlitchDone }: WordmarkProps) {
  const face = useGlitchText(glitching, onGlitchDone)

  return (
    <h1 className="am-mark">
      <span className="am-quiet">{MARK_TEXT}</span>
      <span className="am-mark-face" ref={faceRef} data-text={face} aria-hidden="true">
        {face}
      </span>
    </h1>
  )
}
