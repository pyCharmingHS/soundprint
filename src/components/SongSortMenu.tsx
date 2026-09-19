import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { fadeIn } from '../animations/variants'
import { useLocale } from '../i18n/LocaleContext'
import { SONG_SORT_OPTIONS, type SongSortOption } from '../lib/songSort'

const LABEL_KEYS: Record<SongSortOption, string> = {
  curated: 'pantheon.sort.curated',
  'title-asc': 'pantheon.sort.titleAsc',
  'title-desc': 'pantheon.sort.titleDesc',
  'year-asc': 'pantheon.sort.yearAsc',
  'year-desc': 'pantheon.sort.yearDesc',
}

interface SongSortMenuProps {
  value: SongSortOption
  onChange: (value: SongSortOption) => void
}

function SongSortMenu({ value, onChange }: SongSortMenuProps) {
  const { t } = useLocale()
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

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
        className="flex cursor-pointer items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 text-sm text-muted transition-colors hover:border-gold/50 hover:text-foreground"
      >
        <span className="text-xs tracking-wide uppercase">{t('pantheon.sortBy')}</span>
        <span className="text-foreground">{t(LABEL_KEYS[value])}</span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="absolute top-full right-0 z-20 mt-2 flex w-56 flex-col gap-1 rounded-md border border-border bg-surface p-1.5 shadow-lg"
          >
            {SONG_SORT_OPTIONS.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => {
                  onChange(option)
                  setOpen(false)
                }}
                className={`rounded-sm px-2 py-1.5 text-left text-sm transition-colors ${
                  option === value ? 'text-gold' : 'text-foreground hover:text-gold'
                }`}
              >
                {t(LABEL_KEYS[option])}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default SongSortMenu
