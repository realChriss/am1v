import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type RefObject,
} from 'react'

const SLIDES = 2
const WHEEL_GAP_MS = 400
const KEY_STEP_PX = 64
const EDGE_SLOP = 1

type DeckOptions = {
  enabled: boolean
  trackRef: RefObject<HTMLElement | null>
}

export function useDeck({ enabled, trackRef }: DeckOptions) {
  const [slide, setSlide] = useState(0)
  const [moved, setMoved] = useState(false)

  const slideRef = useRef(0)
  const lastWheel = useRef(0)
  const dir = useRef(1)

  const paneRef = useRef<HTMLElement | null>(null)
  const roomRef = useRef(0)

  const edge = useCallback((down: boolean) => {
    const el = paneRef.current
    const room = roomRef.current
    if (!el || room <= EDGE_SLOP) return { el, atEdge: true }

    return {
      el,
      atEdge: down ? el.scrollTop >= room - EDGE_SLOP : el.scrollTop <= EDGE_SLOP,
    }
  }, [])

  const go = useCallback((step: number) => {
    if (step) dir.current = step > 0 ? 1 : -1
    setMoved(true)
    setSlide((s) => Math.min(SLIDES - 1, Math.max(0, s + step)))
  }, [])

  const jump = useCallback((to: number) => {
    dir.current = to > slideRef.current ? 1 : -1
    setMoved(true)
    setSlide(to)
  }, [])

  useLayoutEffect(() => {
    slideRef.current = slide
    const el =
      trackRef.current?.querySelectorAll<HTMLElement>(':scope > [data-pane]')[slide] ?? null

    paneRef.current = el
    if (el) el.scrollTop = dir.current > 0 ? 0 : el.scrollHeight
  }, [slide, trackRef])

  useEffect(() => {
    if (!enabled) return

    const onKey = (event: KeyboardEvent) => {
      if (event.altKey || event.ctrlKey || event.metaKey) return

      if (event.target instanceof Element && event.target.closest('.am-volume')) return

      if (event.key === 'Home' || event.key === 'End') {
        jump(event.key === 'Home' ? 0 : SLIDES - 1)
        event.preventDefault()
        return
      }

      const paged = event.key === 'PageDown' || event.key === 'PageUp'
      const step =
        event.key === 'ArrowDown' || event.key === 'PageDown'
          ? 1
          : event.key === 'ArrowUp' || event.key === 'PageUp'
            ? -1
            : 0

      if (!step) return

      const { el, atEdge } = edge(step > 0)

      if (el && !atEdge) {
        el.scrollBy({
          top: step * (paged ? el.clientHeight * 0.9 : KEY_STEP_PX),
          behavior: 'smooth',
        })
      } else go(step)

      event.preventDefault()
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [enabled, go, jump, edge])

  useEffect(() => {
    if (!enabled) return

    const onWheel = (event: WheelEvent) => {
      const now = Date.now()
      const gap = now - lastWheel.current
      lastWheel.current = now

      if (gap < WHEEL_GAP_MS) return
      if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return

      const down = event.deltaY > 0
      if (!edge(down).atEdge) return

      go(down ? 1 : -1)
    }

    window.addEventListener('wheel', onWheel, { passive: true })
    return () => window.removeEventListener('wheel', onWheel)
  }, [enabled, go, edge])

  useEffect(() => {
    const el = paneRef.current
    if (!el) return

    let lead = ''
    let tail = ''

    const paint = () => {
      const room = roomRef.current
      const scrolls = room > EDGE_SLOP
      const nextLead = scrolls && el.scrollTop > EDGE_SLOP ? '1' : '0'
      const nextTail = scrolls && el.scrollTop < room - EDGE_SLOP ? '1' : '0'
      if (nextLead === lead && nextTail === tail) return

      lead = nextLead
      tail = nextTail
      el.style.setProperty('--fade-top', lead)
      el.style.setProperty('--fade-bot', tail)
    }

    const measure = () => {
      const room = el.scrollHeight - el.clientHeight
      roomRef.current = room
      el.toggleAttribute('data-scroll', room > EDGE_SLOP)
      paint()
    }

    measure()

    const observer = new ResizeObserver(measure)
    observer.observe(el)
    if (el.firstElementChild) observer.observe(el.firstElementChild)
    el.addEventListener('scroll', paint, { passive: true })

    return () => {
      el.removeEventListener('scroll', paint)
      observer.disconnect()
    }
  }, [slide])

  return { slide, moved, atStart: slide === 0, atEnd: slide === SLIDES - 1, go }
}
