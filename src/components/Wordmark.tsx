import type { RefObject } from 'react'
import { MARK_TEXT } from '../content'

type WordmarkProps = {
  faceRef: RefObject<HTMLSpanElement | null>
  face: string
}

/**
 * The name. The painted layer is `face`, which scrambles during the glitch, so
 * a stable copy sits underneath it for screen readers.
 */
export default function Wordmark({ faceRef, face }: WordmarkProps) {
  return (
    <h1 className="am-mark">
      <span className="am-quiet">{MARK_TEXT}</span>
      <span className="am-mark-face" ref={faceRef} data-text={face} aria-hidden="true">
        {face}
      </span>
    </h1>
  )
}
