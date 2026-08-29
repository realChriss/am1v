import { useCallback, type CSSProperties } from 'react'
import '../app.css'
import { useDeck } from '../hooks/useDeck'
import { useField } from '../hooks/useField'
import { useGateInput } from '../hooks/useGateInput'
import { usePhase } from '../hooks/usePhase'
import { useVideo } from '../hooks/useVideo'
import Backdrop from './Backdrop'
import DeckNav from './DeckNav'
import Gate from './Gate'
import Hero from './Hero'
import Volume from './Volume'
import Work from './Work'

export default function Page() {
  const { phase, endGlitch, start, refs } = usePhase()

  const glitching = phase === 'glitch'
  const revealed = phase === 'intro' || phase === 'ready'
  const live = revealed || glitching

  const { canvasRef, fieldKey, lit } = useField({ active: live })
  const { videoRef, volume, setVolume, roll } = useVideo({ active: live && lit })
  const { slide, moved, atStart, atEnd, go } = useDeck({ enabled: phase === 'ready' })

  const enter = useCallback(() => {
    if (start()) roll()
  }, [start, roll])

  useGateInput(phase === 'gate', enter)

  const flags = [
    phase === 'hold' && 'is-hold',
    phase === 'gate' && 'is-gate',
    glitching && 'is-glitch',
    live && 'is-mark',
    live && 'is-live',
    revealed && 'is-intro',
    lit && 'is-lit',
    moved && 'is-moved',
  ]

  return (
    <div className={['am-page', ...flags.filter(Boolean)].join(' ')}>
      <Backdrop
        canvasRef={canvasRef}
        videoRef={videoRef}
        fieldKey={fieldKey}
        ready={phase !== 'hold'}
      />

      <div className="am-track" style={{ '--slide': slide } as CSSProperties}>
        <Hero
          active={atStart}
          stackRef={refs.stackRef}
          markRef={refs.markRef}
          faceRef={refs.faceRef}
          glitching={glitching}
          onGlitchDone={endGlitch}
        />
        <Work shown={!atStart} />
      </div>

      <DeckNav navRef={refs.navRef} atStart={atStart} atEnd={atEnd} onStep={go} />

      <Volume value={volume} onChange={setVolume} active={revealed} />

      {phase === 'gate' && <Gate onEnter={enter} />}
    </div>
  )
}
