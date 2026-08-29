import { useEffect, useRef, useState } from 'react'
import { GATE_TEXT, MARK_TEXT } from '../content'

const GLITCH_MS = 760
const GLITCH_STEP_MS = 42
const GLYPHS = '@#%&$*+=<>[]{}/|01am1v.?!~^'

// Progress at which each slot stops scrambling and locks to its final glyph.
// Slots that survive into the shorter word settle late; the trailing ones that
// get dropped settle early, so the text collapses from the right.
const lockTimes = (slots: number, keep: number) =>
  Array.from({ length: slots }, (_, i) =>
    i >= keep
      ? 0.08 + ((i - keep) / (slots - keep)) * 0.2 + Math.random() * 0.05
      : 0.44 + (i / keep) * 0.3 + Math.random() * 0.12,
  )

/**
 * Scrambles GATE_TEXT into MARK_TEXT while `running`, then calls `onDone`.
 * Holds whichever text it last settled on once it stops.
 */
export function useGlitchText(running: boolean, onDone: () => void) {
  const [face, setFace] = useState(GATE_TEXT)
  const done = useRef(onDone)

  useEffect(() => {
    done.current = onDone
  })

  useEffect(() => {
    if (!running) return

    const slots = Math.max(GATE_TEXT.length, MARK_TEXT.length)
    const locks = lockTimes(slots, MARK_TEXT.length)
    const began = performance.now()
    let painted = -Infinity
    let raf = 0

    const tick = (now: number) => {
      const t = Math.min(1, (now - began) / GLITCH_MS)

      if (t >= 1) {
        setFace(MARK_TEXT)
        done.current()
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
  }, [running])

  return face
}
