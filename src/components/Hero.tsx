import type { RefObject } from 'react'
import SocialLinks from './SocialLinks'
import Wordmark from './Wordmark'

type HeroProps = {
  active: boolean
  stackRef: RefObject<HTMLElement | null>
  markRef: RefObject<HTMLDivElement | null>
  faceRef: RefObject<HTMLSpanElement | null>
  face: string
}

export default function Hero({ active, stackRef, markRef, faceRef, face }: HeroProps) {
  return (
    <section className="am-hero" inert={!active}>
      <main className="am-stack" ref={stackRef}>
        <div className="am-mark-lift" ref={markRef}>
          <Wordmark faceRef={faceRef} face={face} />
        </div>

        <p className="am-role">Web Developer &amp; Software Enthusiast</p>
        <p className="am-meta">21 &middot; Germany</p>

        <SocialLinks />
      </main>
    </section>
  )
}
