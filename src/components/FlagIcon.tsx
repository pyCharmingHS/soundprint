import type { ReactNode } from 'react'
import type { FlagCode } from '../i18n/locale'

interface FlagIconProps {
  code: FlagCode
  className?: string
}

// Hand-drawn, simplified flags — not vexillologically exact, but
// deliberately independent of OS/browser emoji-font support. Unicode flag
// emoji are two combined "regional indicator" characters, and that
// combining step is exactly what's unreliable across systems — Windows in
// particular often renders the pair as literal two-letter text instead of
// a single flag glyph, which is the "garbled text" this replaces.
const FLAG_CONTENT: Record<FlagCode, ReactNode> = {
  us: (
    <>
      <rect width="24" height="16" fill="#B22234" />
      <rect y="1.23" width="24" height="1.23" fill="#fff" />
      <rect y="3.69" width="24" height="1.23" fill="#fff" />
      <rect y="6.15" width="24" height="1.23" fill="#fff" />
      <rect y="8.62" width="24" height="1.23" fill="#fff" />
      <rect y="11.08" width="24" height="1.23" fill="#fff" />
      <rect y="13.54" width="24" height="1.23" fill="#fff" />
      <rect width="10" height="8.62" fill="#3C3B6E" />
      <circle cx="2" cy="2" r="0.5" fill="#fff" />
      <circle cx="5" cy="2" r="0.5" fill="#fff" />
      <circle cx="8" cy="2" r="0.5" fill="#fff" />
      <circle cx="2" cy="4.5" r="0.5" fill="#fff" />
      <circle cx="5" cy="4.5" r="0.5" fill="#fff" />
      <circle cx="8" cy="4.5" r="0.5" fill="#fff" />
      <circle cx="2" cy="7" r="0.5" fill="#fff" />
      <circle cx="5" cy="7" r="0.5" fill="#fff" />
      <circle cx="8" cy="7" r="0.5" fill="#fff" />
    </>
  ),
  gb: (
    <>
      <rect width="24" height="16" fill="#00247d" />
      <polygon points="0,0 3,0 24,14 24,16 21,16 0,2" fill="#fff" />
      <polygon points="24,0 21,0 0,14 0,16 3,16 24,2" fill="#fff" />
      <polygon points="0,0 1.5,0 24,15 24,16 22.5,16 0,1" fill="#cf142b" />
      <polygon points="24,0 22.5,0 0,15 0,16 1.5,16 24,1" fill="#cf142b" />
      <rect x="9.5" width="5" height="16" fill="#fff" />
      <rect y="5.5" width="24" height="5" fill="#fff" />
      <rect x="10.5" width="3" height="16" fill="#cf142b" />
      <rect y="6.5" width="24" height="3" fill="#cf142b" />
    </>
  ),
  au: (
    <>
      <rect width="24" height="16" fill="#00247d" />
      <rect width="12" height="8" fill="#00247d" />
      <rect x="5" width="2" height="8" fill="#fff" />
      <rect y="3" width="12" height="2" fill="#fff" />
      <rect x="5.5" width="1" height="8" fill="#cf142b" />
      <rect y="3.5" width="12" height="1" fill="#cf142b" />
      <circle cx="18" cy="4" r="0.6" fill="#fff" />
      <circle cx="20" cy="9" r="0.6" fill="#fff" />
      <circle cx="16" cy="11" r="0.6" fill="#fff" />
      <circle cx="19" cy="13" r="0.5" fill="#fff" />
      <circle cx="9" cy="12" r="0.7" fill="#fff" />
    </>
  ),
  do: (
    <>
      <rect width="24" height="16" fill="#fff" />
      <rect width="10" height="7" fill="#002d62" />
      <rect x="14" width="10" height="7" fill="#ce1126" />
      <rect y="9" width="10" height="7" fill="#ce1126" />
      <rect x="14" y="9" width="10" height="7" fill="#002d62" />
    </>
  ),
  mx: (
    <>
      <rect width="24" height="16" fill="#fff" />
      <rect width="8" height="16" fill="#006341" />
      <rect x="16" width="8" height="16" fill="#ce1126" />
      <circle cx="12" cy="8" r="1.8" fill="#006341" fillOpacity="0.5" />
    </>
  ),
  es: (
    <>
      <rect width="24" height="16" fill="#AA151B" />
      <rect y="4" width="24" height="8" fill="#F1BF00" />
    </>
  ),
  it: (
    <>
      <rect width="24" height="16" fill="#fff" />
      <rect width="8" height="16" fill="#009246" />
      <rect x="16" width="8" height="16" fill="#ce2b37" />
    </>
  ),
  br: (
    <>
      <rect width="24" height="16" fill="#009739" />
      <polygon points="12,1.5 22.5,8 12,14.5 1.5,8" fill="#fedd00" />
      <circle cx="12" cy="8" r="4" fill="#012169" />
    </>
  ),
  pt: (
    <>
      <rect width="24" height="16" fill="#ce1126" />
      <rect width="9.6" height="16" fill="#006600" />
      <circle cx="9.6" cy="8" r="3" fill="#ffcc00" />
      <circle cx="9.6" cy="8" r="2" fill="#fff" />
    </>
  ),
}

function FlagIcon({ code, className = '' }: FlagIconProps) {
  return (
    <svg
      viewBox="0 0 24 16"
      role="img"
      aria-hidden="true"
      className={`inline-block h-[0.9em] w-[1.35em] shrink-0 align-middle ${className}`}
    >
      {FLAG_CONTENT[code]}
    </svg>
  )
}

export default FlagIcon
