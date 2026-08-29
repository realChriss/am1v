import type { RefObject } from 'react'
import { VIDEO_SRC } from '../content'

type BackdropProps = {
  canvasRef: RefObject<HTMLCanvasElement | null>
  videoRef: RefObject<HTMLVideoElement | null>
  fieldKey: number
  ready: boolean
}

export default function Backdrop({ canvasRef, videoRef, fieldKey, ready }: BackdropProps) {
  return (
    <>
      <canvas key={fieldKey} ref={canvasRef} className="am-field" aria-hidden="true" />
      <video
        ref={videoRef}
        className="am-video"
        src={ready ? VIDEO_SRC : undefined}
        loop
        muted
        playsInline
        preload="auto"
        aria-hidden="true"
        tabIndex={-1}
      />
      <div className="am-scrim" aria-hidden="true" />
    </>
  )
}
