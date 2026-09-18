import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { fadeIn } from '../animations/variants'
import { useLocale } from '../i18n/LocaleContext'
import { LOCALES, type FlagCode } from '../i18n/locale'
import FlagIcon from './FlagIcon'

function FlagCluster({ flags, className = '' }: { flags: FlagCode[]; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-0.5 ${className}`}>
      {flags.map((flag) => (
        <FlagIcon key={flag} code={flag} className="rounded-[1px] ring-1 ring-ink" />
      ))}
    </span>
  )
}

function LanguagePicker() {
  const { locale, setLocale, t } = useLocale()
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const current = LOCALES.find((l) => l.code === locale) ?? LOCALES[0]

  useEffect(() => {
    if (!open) return
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={t('languagePicker.ariaLabel')}
        className="flex cursor-pointer items-center gap-1.5 rounded-full border border-border bg-surface px-2.5 py-1 text-xs text-muted transition-colors hover:border-gold/50 hover:text-foreground"
      >
        <FlagCluster flags={current.flags} className="text-sm" />
        <span className="tracking-wide uppercase">{current.code}</span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="absolute top-full right-0 z-20 mt-2 flex w-44 flex-col gap-1 rounded-md border border-border bg-surface p-1.5 shadow-lg"
          >
            {LOCALES.map((l) => (
              <button
                key={l.code}
                type="button"
                onClick={() => {
                  setLocale(l.code)
                  setOpen(false)
                }}
                className={`flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm transition-colors ${
                  l.code === locale ? 'text-gold' : 'text-foreground hover:text-gold'
                }`}
              >
                <FlagCluster flags={l.flags} className="text-base" />
                <span>{l.nativeName}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default LanguagePicker
