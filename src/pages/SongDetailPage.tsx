import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { fadeUp, staggerContainer } from '../animations/variants'
import AlbumArt from '../components/AlbumArt'
import StatBar from '../components/StatBar'
import YouTubeIcon from '../components/YouTubeIcon'
import { useLocale } from '../i18n/LocaleContext'
import { formatDate, formatHourLabel, formatHours, languageName, mostCommonKey } from '../lib/format'
import { loadCategories, loadSongs } from '../lib/data'
import { isSongNavState } from '../lib/songNav'
import type { Category, Song } from '../types'

function SongDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const { t, locale, localize } = useLocale()
  const [song, setSong] = useState<Song | null | undefined>(undefined)
  const [categories, setCategories] = useState<Category[]>([])

  useEffect(() => {
    loadSongs().then((songs) => setSong(songs.find((s) => s.id === id) ?? null))
    loadCategories().then(setCategories)
  }, [id])

  // Present only when we arrived here from a list (the Pantheon grid, Home's
  // highlights, ...) — lets Prev/Next step through that exact list and Back
  // return to exactly that view, instead of a blind browser-history pop.
  const navState = isSongNavState(location.state) ? location.state : null
  const currentIndex = navState ? navState.songIds.indexOf(id ?? '') : -1
  const hasSiblings = navState !== null && navState.songIds.length > 1 && currentIndex !== -1

  function goToOffset(offset: number) {
    if (!navState || !hasSiblings) return
    const total = navState.songIds.length
    const nextIndex = (currentIndex + offset + total) % total
    navigate(`/song/${navState.songIds[nextIndex]}`, { state: navState, replace: true })
  }

  function goBack() {
    if (navState) navigate(navState.returnTo)
    else navigate(-1)
  }

  useEffect(() => {
    if (!hasSiblings) return
    function handleKeyDown(event: KeyboardEvent) {
      if (event.metaKey || event.ctrlKey || event.altKey) return
      if (event.key === 'ArrowLeft') goToOffset(-1)
      else if (event.key === 'ArrowRight') goToOffset(1)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
    // goToOffset closes over currentIndex/navState, both already covered below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasSiblings, currentIndex, navState])

  if (song === undefined) return null

  if (song === null) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-muted">{t('song.notFound')}</p>
      </div>
    )
  }

  const { personal, listening } = song
  const mostActiveDay = mostCommonKey(listening.playsByDay)
  const mostActiveHour = mostCommonKey(listening.playsByHour)
  const categoryById = new Map(categories.map((c) => [c.id, c]))
  const why = localize(personal.why)
  const memories = localize(personal.memories)

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={song.id}
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        exit="hidden"
        className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-6 py-8 sm:gap-10 sm:py-16"
      >
        <motion.div variants={fadeUp} className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={goBack}
            className="flex w-fit cursor-pointer items-center gap-1 text-sm text-muted transition-colors hover:text-gold"
          >
            ← {t('song.back')}
          </button>
          {hasSiblings && navState && (
            <div className="flex items-center gap-3 text-sm text-muted">
              <button
                type="button"
                onClick={() => goToOffset(-1)}
                aria-label={t('song.previous')}
                className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border border-border transition-colors hover:border-gold hover:text-gold"
              >
                ‹
              </button>
              <span className="tabular-nums">
                {currentIndex + 1} / {navState.songIds.length}
              </span>
              <button
                type="button"
                onClick={() => goToOffset(1)}
                aria-label={t('song.next')}
                className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border border-border transition-colors hover:border-gold hover:text-gold"
              >
                ›
              </button>
            </div>
          )}
        </motion.div>

        <motion.div variants={fadeUp} className="flex flex-col items-center gap-4 text-center">
        <AlbumArt
          src={song.artwork}
          title={song.title}
          artist={song.artist}
          className="w-48"
        />
        <div>
          <h1 className="text-3xl">{song.title}</h1>
          <p className="text-muted">
            {[song.artist, song.releaseYear, song.language && languageName(song.language, locale)]
              .filter(Boolean)
              .join(' · ')}
          </p>
        </div>
        {personal.isPantheon && (
          <span className="text-sm tracking-wide text-gold">
            🏛️ {t('song.pantheonBadge')}{personal.pantheonRank ? ` — #${personal.pantheonRank}` : ''}
          </span>
        )}
        {song.youtubeUrl && (
          <a
            href={song.youtubeUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={t('song.watchOnYouTube')}
            title={t('song.watchOnYouTube')}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted transition-colors hover:border-gold hover:text-gold"
          >
            <YouTubeIcon className="h-4 w-4" />
          </a>
        )}
      </motion.div>

      {why && (
        <motion.div variants={fadeUp} className="flex flex-col gap-2 border-t border-border pt-6 sm:pt-8">
          <h2 className="text-sm tracking-wide text-muted uppercase">{t('song.whyHeading')}</h2>
          <p className="text-lg italic">"{why}"</p>
          {memories && <p className="text-sm text-muted">{memories}</p>}
        </motion.div>
      )}

      {(personal.rating !== undefined ||
        personal.emotionalIntensity !== undefined ||
        personal.nostalgia !== undefined ||
        personal.meaning !== undefined) && (
        <motion.div variants={fadeUp} className="flex flex-col gap-2 border-t border-border pt-6 sm:pt-8">
          <h2 className="text-sm tracking-wide text-muted uppercase">
            {t('song.emotionalProfileHeading')}
          </h2>
          <div className="flex flex-col gap-1.5">
            {personal.rating !== undefined && (
              <StatBar label={t('song.rating')} value={personal.rating} max={10} />
            )}
            {personal.emotionalIntensity !== undefined && (
              <StatBar label={t('song.intensity')} value={personal.emotionalIntensity} max={10} />
            )}
            {personal.nostalgia !== undefined && (
              <StatBar label={t('song.nostalgia')} value={personal.nostalgia} max={10} />
            )}
            {personal.meaning !== undefined && (
              <StatBar label={t('song.meaning')} value={personal.meaning} max={10} />
            )}
          </div>
        </motion.div>
      )}

      <motion.div variants={fadeUp} className="flex flex-col gap-2 border-t border-border pt-6 sm:pt-8">
        <h2 className="text-sm tracking-wide text-muted uppercase">{t('song.myListeningHeading')}</h2>
        <p>
          {t('common.plays', { count: listening.plays })} · {formatHours(listening.minutes)}{' '}
          {t('common.hoursUnit')}
        </p>
        {listening.firstListened && (
          <p className="text-sm text-muted">
            {t('song.firstHeard')} {formatDate(listening.firstListened, locale)}
          </p>
        )}
        {listening.lastListened && (
          <p className="text-sm text-muted">
            {t('song.lastHeard')} {formatDate(listening.lastListened, locale)}
          </p>
        )}
        {(mostActiveDay || mostActiveHour) && (
          <p className="text-sm text-muted">
            {t('song.mostCommonlyPlayed')}{' '}
            {[
              mostActiveDay && t(`weekday.${mostActiveDay}`),
              mostActiveHour && formatHourLabel(mostActiveHour, locale),
            ]
              .filter(Boolean)
              .join(', ')}
          </p>
        )}
      </motion.div>

      {personal.categories.length > 0 && (
        <motion.div variants={fadeUp} className="flex flex-col gap-2 border-t border-border pt-6 sm:pt-8">
          <h2 className="text-sm tracking-wide text-muted uppercase">
            {t('song.categoriesHeading')}
          </h2>
          <div className="flex flex-wrap gap-2">
            {personal.categories.map((categoryId) => {
              const category = categoryById.get(categoryId)
              const categoryName = category ? localize(category.name) : undefined
              return (
                <Link
                  key={categoryId}
                  to={`/pantheon?category=${categoryId}`}
                  className="rounded-full border border-border bg-surface px-3 py-1 text-sm transition-colors hover:border-gold hover:text-gold"
                >
                  {category ? `${category.emoji ?? ''} ${categoryName}`.trim() : categoryId}
                </Link>
              )
            })}
          </div>
        </motion.div>
      )}

      {personal.tags.length > 0 && (
        <motion.div variants={fadeUp} className="flex flex-col gap-2 border-t border-border pt-6 sm:pt-8">
          <h2 className="text-sm tracking-wide text-muted uppercase">{t('song.tagsHeading')}</h2>
          <div className="flex flex-wrap gap-2">
            {personal.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-border px-3 py-1 text-sm text-muted"
              >
                {tag}
              </span>
            ))}
          </div>
        </motion.div>
      )}
      </motion.div>
    </AnimatePresence>
  )
}

export default SongDetailPage
