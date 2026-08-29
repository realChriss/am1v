import { useEffect, useRef, useState, type ChangeEvent, type CSSProperties } from 'react'
import { VolumeIcon, VolumeMuteIcon } from './icons'

type VolumeProps = {
  value: number
  onChange: (level: number) => void
  active: boolean
}

export default function Volume({ value, onChange, active }: VolumeProps) {
  const rangeRef = useRef<HTMLInputElement>(null)
  const audible = useRef(value)
  const [live, setLive] = useState(false)
  const muted = value === 0

  useEffect(() => {
    if (!live) return

    const stop = () => {
      setLive(false)
      rangeRef.current?.blur()
    }

    window.addEventListener('pointerup', stop)
    window.addEventListener('pointercancel', stop)
    return () => {
      window.removeEventListener('pointerup', stop)
      window.removeEventListener('pointercancel', stop)
    }
  }, [live])

  const toggle = () => {
    if (muted) {
      onChange(audible.current)
      return
    }
    audible.current = value
    onChange(0)
  }

  const slide = (event: ChangeEvent<HTMLInputElement>) => {
    const level = event.currentTarget.valueAsNumber
    if (level > 0) audible.current = level
    onChange(level)
  }

  return (
    <div
      className={`am-volume${live ? ' is-live' : ''}`}
      style={{ '--level': value } as CSSProperties}
      inert={!active}
    >
      <button
        type="button"
        className="am-volume-glyph"
        onClick={toggle}
        aria-label={muted ? 'Unmute' : 'Mute'}
      >
        {muted ? <VolumeMuteIcon /> : <VolumeIcon />}
      </button>

      <input
        ref={rangeRef}
        className="am-volume-range"
        type="range"
        min={0}
        max={1}
        step={0.05}
        value={value}
        onChange={slide}
        onPointerDown={() => setLive(true)}
        aria-label="Volume"
      />
    </div>
  )
}
