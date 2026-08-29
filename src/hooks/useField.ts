import { useEffect, useRef, useState } from 'react'
import { startField } from '../field'

// How many times we let a dead WebGL context rebuild itself before giving up
// and leaving the CSS backdrop in place.
const MAX_RESETS = 3

/**
 * Owns the background canvas. `fieldKey` remounts the element (a fresh element
 * means a fresh GL context); `lit` turns true once the current field has
 * actually painted a frame, which is what the fade-in waits on.
 */
export function useField() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const resets = useRef(0)
  const [fieldKey, setFieldKey] = useState(0)
  const [litKey, setLitKey] = useState(-1)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    return startField(
      canvas,
      () => {
        if (resets.current >= MAX_RESETS) return
        resets.current += 1
        setFieldKey((k) => k + 1)
      },
      () => setLitKey(fieldKey),
    )
  }, [fieldKey])

  return { canvasRef, fieldKey, lit: litKey === fieldKey }
}
