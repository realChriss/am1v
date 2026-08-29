type GateProps = { onEnter: () => void }

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
