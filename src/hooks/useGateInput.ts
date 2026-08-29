import { useEffect } from 'react'

export function useGateInput(enabled: boolean, onEnter: () => void) {
  useEffect(() => {
    if (!enabled) return

    const press = (event: KeyboardEvent) => {
      if (event.altKey || event.ctrlKey || event.metaKey) return
      onEnter()
    }

    const scroll = () => onEnter()

    window.addEventListener('keydown', press)
    window.addEventListener('wheel', scroll, { passive: true })
    return () => {
      window.removeEventListener('keydown', press)
      window.removeEventListener('wheel', scroll)
    }
  }, [enabled, onEnter])
}
