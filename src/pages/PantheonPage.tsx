import { AnimatePresence, motion } from 'framer-motion'
import { Fragment, useEffect, useRef, useState } from 'react'
import { useLocation, useSearchParams } from 'react-router-dom'
import { EASE_CINEMATIC, fadeIn, fadeUp, staggerContainer } from '../animations/variants'
import CategoryCard from '../components/CategoryCard'
import ParallaxLayer from '../components/ParallaxLayer'
import SongCard from '../components/SongCard'
import SongSortMenu from '../components/SongSortMenu'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'
import { useLocale } from '../i18n/LocaleContext'
import { loadCategories, loadSongs } from '../lib/data'
import { decadeLabel, languageName } from '../lib/format'
import { sortSongs, type SongSortOption } from '../lib/songSort'
import type { Category, Song } from '../types'
import EmotionalLandscape from '../visualizations/EmotionalLandscape'

type SimpleMode = 'genre' | 'decade' | 'language'
type BrowseMode = 'category' | SimpleMode

function sortPantheon(songs: Song[]): Song[] {
  return [...songs].sort((a, b) => {
    const rankA = a.personal.pantheonRank ?? Number.POSITIVE_INFINITY
    const rankB = b.personal.pantheonRank ?? Number.POSITIVE_INFINITY
    if (rankA !== rankB) return rankA - rankB
    return (b.personal.addedToPantheon ?? '').localeCompare(
      a.personal.addedToPantheon ?? '',
    )
  })
}

const SIMPLE_MODES: SimpleMode[] = ['genre', 'decade', 'language']

function PantheonPage() {
  const { t, locale, localize } = useLocale()
  const location = useLocation()
  const [categories, setCategories] = useState<Category[]>([])
  const [songs, setSongs] = useState<Song[]>([])
  const [searchParams, setSearchParams] = useSearchParams()
  const activeCategory = searchParams.get('category')
  const activeValues: Record<SimpleMode, string | null> = {
    genre: searchParams.get('genre'),
    decade: searchParams.get('decade'),
    language: searchParams.get('language'),
  }
  const [browseMode, setBrowseMode] = useState<BrowseMode>(
    SIMPLE_MODES.find((mode) => activeValues[mode] !== null) ?? 'category',
  )
  const [sort, setSort] = useState<SongSortOption>('curated')
  const reducedMotion = usePrefersReducedMotion()
  const pillScrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadCategories().then(setCategories)
    loadSongs().then((all) => setSongs(sortPantheon(all.filter((s) => s.personal.isPantheon))))
  }, [])

  // Brings the active pill into view when it's off-screen — most notably
  // when arriving here with a category already selected (e.g. from a Home
  // page link) and that category sits past the row's visible edge.
  useEffect(() => {
    const active = pillScrollRef.current?.querySelector('[data-active="true"]')
    active?.scrollIntoView({
      behavior: reducedMotion ? 'auto' : 'smooth',
      inline: 'nearest',
      block: 'nearest',
    })
  }, [browseMode, activeCategory, activeValues.genre, activeValues.decade, activeValues.language, categories.length, songs.length, reducedMotion])

  const activeCategoryData = categories.find((c) => c.id === activeCategory)

  const simpleModeConfig: Record<
    SimpleMode,
    { values: string[]; matches: (song: Song) => boolean; label: (value: string) => string }
  > = {
    genre: {
      values: [...new Set(songs.flatMap((s) => s.genres))].sort(),
      matches: (song) => song.genres.includes(activeValues.genre!),
      label: (value) => value,
    },
    decade: {
      values: [
        ...new Set(
          songs.filter((s) => s.releaseYear !== undefined).map((s) => decadeLabel(s.releaseYear!)),
        ),
      ].sort(),
      matches: (song) => song.releaseYear !== undefined && decadeLabel(song.releaseYear) === activeValues.decade,
      label: (value) => value,
    },
    language: {
      values: [...new Set(songs.filter((s) => s.language).map((s) => s.language!))].sort(),
      matches: (song) => song.language === activeValues.language,
      label: (value) => languageName(value, locale),
    },
  }

  const activeSimpleMode = SIMPLE_MODES.find((mode) => activeValues[mode] !== null)
  const filteredSongs = activeCategory
    ? songs.filter((song) => song.personal.categories.includes(activeCategory))
    : activeSimpleMode
      ? songs.filter(simpleModeConfig[activeSimpleMode].matches)
      : songs
  const visibleSongs = sortSongs(filteredSongs, sort)

  function switchMode(mode: BrowseMode) {
    setBrowseMode(mode)
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      next.delete('category')
      for (const m of SIMPLE_MODES) next.delete(m)
      return next
    })
  }

  function toggleCategory(categoryId: string) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      for (const m of SIMPLE_MODES) next.delete(m)
      if (activeCategory === categoryId) {
        next.delete('category')
      } else {
        next.set('category', categoryId)
      }
      return next
    })
  }

  function toggleSimpleValue(mode: SimpleMode, value: string) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      next.delete('category')
      for (const m of SIMPLE_MODES) if (m !== mode) next.delete(m)
      if (activeValues[mode] === value) {
        next.delete(mode)
      } else {
        next.set(mode, value)
      }
      return next
    })
  }

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-6 py-8 sm:gap-10 sm:py-16"
    >
      <ParallaxLayer offset={20}>
        <motion.div variants={fadeUp} className="flex flex-col gap-2 text-center">
          <h1 className="text-3xl sm:text-4xl">{t('pantheon.title')}</h1>
          <p className="text-muted">{t('pantheon.subtitle')}</p>
        </motion.div>
      </ParallaxLayer>

      {/* Sticky so switching categories/genres never requires scrolling
          back up past the song grid. Only one pill row shows at a time
          (toggled below) to keep this compact on small screens. `layout`
          on both this container and the row below lets the height change
          (category vs. genre pills wrap differently) settle smoothly
          instead of popping. */}
      <motion.div
        layout
        variants={fadeUp}
        className="sticky top-0 z-10 -mx-6 flex flex-col gap-2 bg-ink/95 px-6 py-2 backdrop-blur sm:py-3"
      >
        <div className="flex items-center justify-center gap-2 text-xs tracking-wide uppercase">
          <span className="text-muted">{t('pantheon.browseBy')}</span>
          {(
            [
              { mode: 'category' as const, label: t('pantheon.category'), visible: true },
              { mode: 'genre' as const, label: t('pantheon.genre'), visible: true },
              {
                mode: 'decade' as const,
                label: t('pantheon.decade'),
                visible: simpleModeConfig.decade.values.length > 0,
              },
              {
                mode: 'language' as const,
                label: t('pantheon.language'),
                visible: simpleModeConfig.language.values.length > 0,
              },
            ] satisfies { mode: BrowseMode; label: string; visible: boolean }[]
          )
            .filter((b) => b.visible)
            .map((b, i) => (
              <Fragment key={b.mode}>
                {i > 0 && <span className="text-border">/</span>}
                <button
                  type="button"
                  onClick={() => switchMode(b.mode)}
                  className={`cursor-pointer transition-colors ${
                    browseMode === b.mode ? 'text-gold' : 'text-muted hover:text-foreground'
                  }`}
                >
                  {b.label}
                </button>
              </Fragment>
            ))}
        </div>

        <div className="relative">
          <motion.div
            ref={pillScrollRef}
            layout
            className="flex flex-nowrap items-center gap-2 overflow-x-auto sm:flex-wrap sm:justify-center sm:gap-3 sm:overflow-visible [mask-image:linear-gradient(to_right,transparent,black_16px,black_calc(100%-28px),transparent)] sm:[mask-image:none]"
          >
            <AnimatePresence mode="popLayout" initial={false}>
              {browseMode === 'category'
                ? categories.map((category) => (
                    <CategoryCard
                      key={category.id}
                      category={category}
                      active={activeCategory === category.id}
                      onClick={() => toggleCategory(category.id)}
                    />
                  ))
                : simpleModeConfig[browseMode].values.map((value) => (
                    <motion.button
                      key={value}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      type="button"
                      data-active={activeValues[browseMode] === value}
                      onClick={() => toggleSimpleValue(browseMode, value)}
                      className={`flex shrink-0 cursor-pointer items-center rounded-full border px-3 py-1.5 text-sm whitespace-nowrap transition-colors sm:px-4 sm:py-2 sm:text-base ${
                        browseMode === 'language' ? 'uppercase' : ''
                      } ${
                        activeValues[browseMode] === value
                          ? 'border-gold bg-gold/10 text-gold'
                          : 'border-border bg-surface hover:border-gold/50'
                      }`}
                    >
                      {simpleModeConfig[browseMode].label(value)}
                    </motion.button>
                  ))}
            </AnimatePresence>
          </motion.div>
          {/* Mobile-only nudge that the pill row scrolls horizontally —
              paired with the edge fade above, which alone wasn't obvious
              enough. Hidden once flex-wrap takes over at sm:. */}
          <motion.span
            aria-hidden="true"
            animate={reducedMotion ? undefined : { x: [0, 3, 0] }}
            transition={{ repeat: Infinity, duration: 1.4, ease: 'easeInOut' }}
            className="pointer-events-none absolute top-1/2 right-0 -translate-y-1/2 text-gold sm:hidden"
          >
            ›
          </motion.span>
        </div>
      </motion.div>

      {/* No selected category (or one with no description) collapses this to
          nothing — `layout` animates the resulting height change smoothly
          instead of reserving fixed dead space like before, matching how
          genre/decade/language sit closer to the grid. */}
      {browseMode === 'category' && (
        <motion.div layout className="flex justify-center">
          <AnimatePresence mode="wait">
            {activeCategoryData?.description && (
              <motion.p
                key={activeCategoryData.id}
                variants={fadeIn}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="mx-auto line-clamp-3 max-w-md text-center leading-6 text-muted"
              >
                {localize(activeCategoryData.description)}
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      <motion.div variants={fadeUp} className="flex justify-end">
        <SongSortMenu value={sort} onChange={setSort} />
      </motion.div>

      <motion.div
        layout
        variants={fadeUp}
        className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4"
      >
        <AnimatePresence mode="popLayout" initial={false}>
          {visibleSongs.map((song) => (
            <motion.div
              key={song.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.35, ease: EASE_CINEMATIC }}
            >
              <SongCard
                song={song}
                showYear
                navState={{
                  songIds: visibleSongs.map((s) => s.id),
                  returnTo: location.pathname + location.search,
                }}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {songs.some(
        (s) => s.personal.meaning !== undefined && s.personal.emotionalIntensity !== undefined,
      ) && (
        <motion.div variants={fadeUp} className="flex flex-col gap-2 border-t border-border pt-6 sm:pt-8">
          <h2 className="text-center text-sm tracking-wide text-muted uppercase">
            {t('pantheon.emotionalLandscapeHeading')}
          </h2>
          <p className="text-center text-sm text-muted">
            {t('pantheon.emotionalLandscapeCaption')}
          </p>
          <EmotionalLandscape songs={songs} />
        </motion.div>
      )}
    </motion.div>
  )
}

export default PantheonPage
