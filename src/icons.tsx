type IconProps = { className?: string; fill?: string }
type StrokeIconProps = { className?: string }

export function GithubIcon({ className, fill = "currentColor" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill={fill} className={className} aria-hidden="true">
      <path d="M12 .5C5.37.5 0 5.87 0 12.5c0 5.3 3.44 9.8 8.2 11.39.6.11.82-.26.82-.58v-2.03c-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.09-.75.08-.73.08-.73 1.2.08 1.84 1.24 1.84 1.24 1.07 1.84 2.81 1.31 3.5 1 .11-.78.42-1.31.76-1.61-2.67-.3-5.47-1.34-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.52.12-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.29-1.55 3.3-1.23 3.3-1.23.66 1.66.24 2.88.12 3.18.77.84 1.24 1.91 1.24 3.22 0 4.6-2.81 5.62-5.49 5.92.43.37.81 1.1.81 2.22v3.29c0 .32.22.7.83.58C20.56 22.29 24 17.8 24 12.5 24 5.87 18.63.5 12 .5Z" />
    </svg>
  )
}

export function BitcoinIcon({ className, fill = "currentColor" }: IconProps) {
  return (
    <svg viewBox="3.61 3.45 16.66 16.66" fill={fill} className={className} aria-hidden="true">
      <path fillRule="evenodd" transform="rotate(-9.081 11.561 11.779)" d="M17.288 10.291c.24-1.59-.974-2.45-2.64-3.03l.54-2.153-1.315-.33-.525 2.107c-.345-.087-.705-.167-1.064-.25l.526-2.127-1.32-.33-.54 2.165c-.285-.067-.565-.132-.84-.2l-1.815-.45-.35 1.407s.975.225.955.238c.535.135.63.486.615.766l-1.477 5.92c-.075.166-.24.406-.614.314.015.02-.96-.24-.96-.24l-.66 1.51 1.71.426.93.242-.54 2.19 1.32.327.54-2.17c.36.1.705.19 1.05.273l-.51 2.154 1.32.33.545-2.19c2.24.427 3.93.257 4.64-1.774.57-1.637-.03-2.58-1.217-3.196.854-.193 1.5-.76 1.68-1.93h.01zm-3.01 4.22c-.404 1.64-3.157.75-4.05.53l.72-2.9c.896.23 3.757.67 3.33 2.37zm.41-4.24c-.37 1.49-2.662.735-3.405.55l.654-2.64c.744.18 3.137.52 2.75 2.084v.006z" />
    </svg>
  )
}

export function VexWaveIcon({ className, fill = "currentColor" }: IconProps) {
  return (
    <svg viewBox="0 0 24 21.7" fill={fill} className={className} aria-hidden="true">
      <path fillOpacity="1" d="M0.31 0.31 12 4.54v4.21z" />
      <path fillOpacity="0.85" d="M0.31 0.31 12 8.75v12.73z" />
      <path fillOpacity="0.62" d="M23.69 0.31 12 4.54v4.21z" />
      <path fillOpacity="0.4" d="M23.69 0.31 12 8.75v12.73z" />
    </svg>
  )
}

export function ArrowUpRightIcon({ className, fill = "currentColor" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill={fill} className={className} aria-hidden="true">
      <path d="M6.4 18.65 5.35 17.6 15.4 7.55H6.5V6.05h11.45V17.5h-1.5V8.6z" />
    </svg>
  )
}

export function ChevronIcon({ className }: StrokeIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <polyline points="5 9 12 16 19 9" />
    </svg>
  )
}
