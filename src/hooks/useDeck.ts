import { useCallback, useEffect, useState } from 'react'

const SLIDES = 2

const WHEEL_GAP_MS = 400

export function useDeck({ enabled }: { enabled: boolean }) {
  const [slide, setSlide] = useState(0)
  const [moved, setMoved] = useState(false)

  const go = useCallback((step: number) => {
    setMoved(true)
    setSlide((s) => Math.min(SLIDES - 1, Math.max(0, s + step)))
  }, [])

  const jump = useCallback((to: number) => {
    setMoved(true)
    setSlide(to)
  }, [])

  useEffect(() => {
    if (!enabled) return

    const onKey = (event: KeyboardEvent) => {
      if (event.altKey || event.ctrlKey || event.metaKey) return

      if (event.target instanceof Element && event.target.closest('.am-volume')) return

      const step =
        event.key === 'ArrowDown' || event.key === 'PageDown'
          ? 1
          : event.key === 'ArrowUp' || event.key === 'PageUp'
            ? -1
            : 0

      if (step) go(step)
      else if (event.key === 'Home' || event.key === 'End') {
        jump(event.key === 'Home' ? 0 : SLIDES - 1)
      } else return

      event.preventDefault()
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [enabled, go, jump])

  useEffect(() => {
    if (!enabled) return
    let last = 0

    const onWheel = (event: WheelEvent) => {
      const now = Date.now()
      const gap = now - last
      last = now
      if (gap >= WHEEL_GAP_MS && Math.abs(event.deltaY) > Math.abs(event.deltaX)) {
        go(event.deltaY > 0 ? 1 : -1)
      }
    }

    window.addEventListener('wheel', onWheel, { passive: true })
    return () => window.removeEventListener('wheel', onWheel)
  }, [enabled, go])

  return { slide, moved, atStart: slide === 0, atEnd: slide === SLIDES - 1, go }
}
