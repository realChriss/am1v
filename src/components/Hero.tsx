import type { RefObject } from 'react'
import SocialLinks from './SocialLinks'
import Wordmark from './Wordmark'

type HeroProps = {
  active: boolean
  stackRef: RefObject<HTMLElement | null>
  markRef: RefObject<HTMLDivElement | null>
  faceRef: RefObject<HTMLSpanElement | null>
  glitching: boolean
  onGlitchDone: () => void
}

export default function Hero({
  active,
  stackRef,
  markRef,
  faceRef,
  glitching,
  onGlitchDone,
}: HeroProps) {
  return (
    <section className="am-hero" data-pane inert={!active}>
      <main className="am-stack" ref={stackRef}>
        <div className="am-mark-lift" ref={markRef}>
          <Wordmark faceRef={faceRef} glitching={glitching} onGlitchDone={onGlitchDone} />
        </div>

        <p className="am-role">Web Developer &amp; Software Enthusiast</p>
        <p className="am-meta">21 &middot; Germany</p>

        <SocialLinks />
      </main>
    </section>
  )
}
