type GateProps = { onEnter: () => void }

/** Transparent full-screen target that starts the intro on any pointer input. */
export default function Gate({ onEnter }: GateProps) {
  return (
    <button
      type="button"
      className="am-gate"
      onPointerDown={onEnter}
      onClick={onEnter}
      aria-label="Enter"
    />
  )
}
