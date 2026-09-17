import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { EASE_CINEMATIC } from '../animations/variants'
import { useLocale } from '../i18n/LocaleContext'
import AlbumArtPattern from './AlbumArtPattern'

const STORAGE_KEY = 'soundprint-intro-seen'

type Phase = 'texture' | 'word1' | 'word2' | 'tagline1' | 'tagline2' | 'done'

const PHASE_DELAYS_MS: Record<Exclude<Phase, 'done'>, number> = {
  texture: 0,
  word1: 500,
  word2: 1300,
  tagline1: 2600,
  tagline2: 3500,
}

function prefersReducedMotion(): boolean {
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  } catch {
    return false
  }
}

function hasSeenIntro(): boolean {
  try {
    return sessionStorage.getItem(STORAGE_KEY) === '1'
  } catch {
    return false
  }
}

function markIntroSeen() {
  try {
    sessionStorage.setItem(STORAGE_KEY, '1')
  } catch {
    // ignore — replaying the intro once more isn't a big deal
  }
}

/**
 * The vision doc's "black screen -> THE PANTHEON -> tagline" opening
 * sequence (section 13). Plays once per browser session, skips itself
 * entirely for prefers-reduced-motion, and is click-anywhere-to-skip.
 * Renders as a fixed overlay — HomePage underneath is unaffected either way.
 */
function OpeningAnimation() {
  const { t } = useLocale()
  const skippedRef = useRef(false)
  const [phase, setPhase] = useState<Phase>(() =>
    hasSeenIntro() || prefersReducedMotion() ? 'done' : 'texture',
  )

  useEffect(() => {
    if (phase === 'done') return

    const timers = (Object.entries(PHASE_DELAYS_MS) as [Exclude<Phase, 'done'>, number][]).map(
      ([p, delay]) =>
        setTimeout(() => {
          if (!skippedRef.current) setPhase(p)
        }, delay),
    )
    const doneTimer = setTimeout(
      () => {
        if (!skippedRef.current) {
          setPhase('done')
          markIntroSeen()
        }
      },
      PHASE_DELAYS_MS.tagline2 + 1300,
    )

    return () => {
      timers.forEach(clearTimeout)
      clearTimeout(doneTimer)
    }
    // Time-driven, not phase-driven — this schedules the whole sequence
    // once on mount rather than re-scheduling as `phase` itself changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function skip() {
    if (skippedRef.current) return
    skippedRef.current = true
    setPhase('done')
    markIntroSeen()
  }

  const wordmark = t('home.wordmark')
  const [firstWord, ...restWords] = wordmark.split(' ')
  const secondWord = restWords.join(' ')

  const showWord1 = phase !== 'texture'
  const showWord2 = phase === 'word2' || phase === 'tagline1' || phase === 'tagline2'
  const showTagline1 = phase === 'tagline1' || phase === 'tagline2'
  const showTagline2 = phase === 'tagline2'

  return (
    <AnimatePresence>
      {phase !== 'done' && (
        <motion.div
          onClick={skip}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: EASE_CINEMATIC }}
          className="fixed inset-0 z-50 flex cursor-pointer flex-col items-center justify-center gap-4 bg-ink"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden opacity-[0.06]"
          >
            <div className="h-[140vmax] w-[140vmax]">
              <AlbumArtPattern title="the" artist="pantheon" alt="" />
            </div>
          </div>

          <div className="relative flex flex-col items-center gap-2 text-center">
            {showWord1 && (
              <motion.span
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: EASE_CINEMATIC }}
                className="text-3xl tracking-[0.3em] text-muted sm:text-4xl"
              >
                {firstWord}
              </motion.span>
            )}
            {showWord2 && (
              <span className="text-5xl tracking-tight sm:text-7xl">
                {secondWord.split('').map((letter, i) => (
                  <motion.span
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: EASE_CINEMATIC, delay: i * 0.05 }}
                    className="inline-block"
                  >
                    {letter}
                  </motion.span>
                ))}
              </span>
            )}
          </div>

          {showTagline1 && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, ease: EASE_CINEMATIC }}
              className="relative max-w-md text-lg text-muted italic"
            >
              {t('home.tagline1')}
            </motion.p>
          )}
          {showTagline2 && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, ease: EASE_CINEMATIC }}
              className="relative text-lg text-foreground"
            >
              {t('home.tagline2')}
            </motion.p>
          )}

          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            transition={{ duration: 1, delay: 1.5 }}
            className="absolute right-6 bottom-6 text-xs tracking-wide text-muted uppercase"
          >
            {t('home.introSkip')}
          </motion.span>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default OpeningAnimation
