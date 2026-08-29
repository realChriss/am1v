import type { RefObject } from 'react'
import { VIDEO_SRC } from '../content'

type BackdropProps = {
  canvasRef: RefObject<HTMLCanvasElement | null>
  videoRef: RefObject<HTMLVideoElement | null>
  fieldKey: number
}

/**
 * Everything behind the content: the WebGL rain field, the looping video and
 * the vignette that keeps text readable over both.
 */
export default function Backdrop({ canvasRef, videoRef, fieldKey }: BackdropProps) {
  return (
    <>
      {/* Keyed so a lost context gets a brand new element to bind to. */}
      <canvas key={fieldKey} ref={canvasRef} className="am-field" aria-hidden="true" />
      <video
        ref={videoRef}
        className="am-video"
        src={VIDEO_SRC}
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
