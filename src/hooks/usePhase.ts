import { useCallback, useEffect, useRef, useState } from 'react'
import { useGlitchText } from './useGlitchText'

// Longest we sit on black waiting for the display face before opening anyway.
const FONT_WAIT_MS = 900
// Backstop in case the intro animations never report finishing.
const READY_MAX_MS = 3400
const MARK_FONT = '900 100px Archivo'

export type Phase = 'hold' | 'gate' | 'glitch' | 'intro' | 'ready'

/**
 * The intro state machine: hold -> gate -> glitch -> intro -> ready.
 *
 * It owns the elements the sequence has to measure or listen to, so the
 * components below only have to attach the refs it hands back.
 */
export function usePhase() {
  const stackRef = useRef<HTMLElement>(null)
  const markRef = useRef<HTMLDivElement>(null)
  const faceRef = useRef<HTMLSpanElement>(null)
  const navRef = useRef<HTMLElement>(null)
  const [phase, setPhase] = useState<Phase>('hold')

  const face = useGlitchText(phase === 'glitch', () => setPhase('intro'))

  // How far the wordmark has to travel to sit centred before the intro lifts
  // it back into the stack.
  const measure = useCallback(() => {
    const stack = stackRef.current
    const mark = markRef.current
    if (!stack || !mark) return
    const lift = (stack.offsetHeight - mark.offsetHeight) / 2
    stack.style.setProperty('--intro-lift', `${lift}px`)
  }, [])

  // hold -> gate, as soon as the display face is usable.
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
  }, [measure])

  // Only worth tracking while the lift is still ahead of us.
  useEffect(() => {
    if (phase === 'intro' || phase === 'ready') return
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [phase, measure])

  /** gate -> glitch. Returns true if this call is what opened the gate. */
  const start = useCallback(() => {
    if (phase !== 'gate') return false
    measure()

    // Sample the breathing animation mid-cycle so the glitch can fade up from
    // wherever it actually was, rather than snapping.
    const el = faceRef.current
    if (el) el.style.setProperty('--gate-opacity', getComputedStyle(el).opacity)

    setPhase('glitch')
    return true
  }, [phase, measure])

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

  // intro -> ready, once the last thing to animate in has landed.
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

  return { phase, face, start, refs: { stackRef, markRef, faceRef, navRef } }
}
