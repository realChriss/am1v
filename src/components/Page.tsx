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
  const { canvasRef, fieldKey, lit } = useField()
  const { phase, face, start, refs } = usePhase()

  const revealed = phase === 'intro' || phase === 'ready'
  const marked = revealed || phase === 'glitch'

  const { videoRef, volume, setVolume, prime } = useVideo({ active: revealed && lit })
  const { slide, moved, atStart, atEnd, go } = useDeck({ enabled: phase === 'ready' })

  // Priming has to ride the same gesture that opens the gate, or the browser
  // refuses to play the video with sound.
  const enter = useCallback(() => {
    if (start()) prime()
  }, [start, prime])

  useGateInput(phase === 'gate', enter)

  const flags = [
    phase === 'hold' && 'is-hold',
    phase === 'gate' && 'is-gate',
    phase === 'glitch' && 'is-glitch',
    marked && 'is-mark',
    revealed && 'is-intro',
    lit && 'is-lit',
    moved && 'is-moved',
  ]

  return (
    <div className={['am-page', ...flags.filter(Boolean)].join(' ')}>
      <Backdrop canvasRef={canvasRef} videoRef={videoRef} fieldKey={fieldKey} />

      <div className="am-track" style={{ '--slide': slide } as CSSProperties}>
        <Hero
          active={atStart}
          stackRef={refs.stackRef}
          markRef={refs.markRef}
          faceRef={refs.faceRef}
          face={face}
        />
        <Work shown={!atStart} />
      </div>

      <DeckNav navRef={refs.navRef} atStart={atStart} atEnd={atEnd} onStep={go} />

      <Volume value={volume} onChange={setVolume} active={revealed} />

      {phase === 'gate' && <Gate onEnter={enter} />}
    </div>
  )
}
