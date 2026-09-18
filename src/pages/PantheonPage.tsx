import { AnimatePresence, motion } from 'framer-motion'
import { Fragment, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { EASE_CINEMATIC, fadeIn, fadeUp, staggerContainer } from '../animations/variants'
import CategoryCard from '../components/CategoryCard'
import ParallaxLayer from '../components/ParallaxLayer'
import SongCard from '../components/SongCard'
import { useLocale } from '../i18n/LocaleContext'
import { loadCategories, loadSongs } from '../lib/data'
import { decadeLabel, languageName } from '../lib/format'
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

  useEffect(() => {
    loadCategories().then(setCategories)
    loadSongs().then((all) => setSongs(sortPantheon(all.filter((s) => s.personal.isPantheon))))
  }, [])

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
  const visibleSongs = activeCategory
    ? songs.filter((song) => song.personal.categories.includes(activeCategory))
    : activeSimpleMode
      ? songs.filter(simpleModeConfig[activeSimpleMode].matches)
      : songs

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

        <motion.div
          layout
          className="flex flex-nowrap items-center gap-2 overflow-x-auto sm:flex-wrap sm:justify-center sm:gap-3 sm:overflow-visible"
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
      </motion.div>

      {/* Fixed height regardless of description length or whether a category
          is selected, so the song grid below never shifts. Only relevant in
          category mode — genre pills already show their own active state. */}
      {browseMode === 'category' && (
        <div className="flex h-[4.5rem] items-start justify-center">
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
        </div>
      )}

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
              <SongCard song={song} />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {songs.some(
        (s) => s.personal.meaning !== undefined && s.personal.emotionalIntensity !== undefined,
      ) && (
        <motion.div variants={fadeUp} className="flex flex-col gap-2 border-t border-border pt-8">
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
