import { useCallback, useEffect, useRef, useState } from 'react'

const DESKTOP = '(hover: hover) and (pointer: fine)'
const START_VOLUME = 0.3

const LIFT_MS = 220

const startVolume = () => (window.matchMedia(DESKTOP).matches ? START_VOLUME : 1)

export function useVideo({ active }: { active: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const rolling = useRef(false)
  const [volume, setVolume] = useState(startVolume)
  const volumeRef = useRef(volume)

  useEffect(() => {
    volumeRef.current = volume
    const video = videoRef.current
    if (!video) return
    video.volume = volume
    video.muted = volume === 0
  }, [volume])

  const prime = useCallback(() => {
    const video = videoRef.current
    if (!video) return
    video.volume = 0
    video.muted = false
    video.play().then(
      () => {
        if (rolling.current) return
        video.pause()
        video.currentTime = 0
      },
      () => {},
    )
  }, [])

  useEffect(() => {
    const video = videoRef.current
    if (!active || !video) return

    const roll = window.setTimeout(() => {
      rolling.current = true
      video.currentTime = 0

      video.volume = volumeRef.current
      video.play().catch(() => {

        video.muted = true
        setVolume(0)
        video.play().catch(() => {})
      })
    }, LIFT_MS)

    return () => window.clearTimeout(roll)
  }, [active])

  return { videoRef, volume, setVolume, prime }
}
