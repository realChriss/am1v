import { useCallback, useEffect, useRef, useState } from 'react'

const DESKTOP = '(hover: hover) and (pointer: fine)'
const START_VOLUME = 0.3

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

  const roll = useCallback(() => {
    const video = videoRef.current
    if (!video || rolling.current) return
    rolling.current = true
    video.currentTime = 0
    video.volume = volumeRef.current
    video.muted = volumeRef.current === 0
    video.play().catch(() => {
      video.muted = true
      setVolume(0)
      video.play().catch(() => {})
    })
  }, [])

  useEffect(() => {
    if (!active) return
    roll()
  }, [active, roll])

  return { videoRef, volume, setVolume, roll }
}
