import { useEffect, useRef, useState } from 'react'
import { startField, type Field } from '../field'

const MAX_RESETS = 3

export function useField({ active }: { active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fieldRef = useRef<Field | null>(null)
  const resets = useRef(0)
  const [fieldKey, setFieldKey] = useState(0)
  const [litKey, setLitKey] = useState(-1)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const field = startField(
      canvas,
      () => {
        if (resets.current >= MAX_RESETS) return
        resets.current += 1
        setFieldKey((k) => k + 1)
      },
      () => setLitKey(fieldKey),
    )
    fieldRef.current = field

    return () => {
      fieldRef.current = null
      field.release()
    }
  }, [fieldKey])

  useEffect(() => {
    fieldRef.current?.setActive(active)
  }, [fieldKey, active])

  return { canvasRef, fieldKey, lit: litKey === fieldKey }
}
