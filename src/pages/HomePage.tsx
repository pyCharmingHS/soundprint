import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fadeUp, staggerContainer } from '../animations/variants'
import AlbumArtPattern from '../components/AlbumArtPattern'
import CategoryCard from '../components/CategoryCard'
import OpeningAnimation from '../components/OpeningAnimation'
import ParallaxLayer from '../components/ParallaxLayer'
import SongCard from '../components/SongCard'
import { useLocale } from '../i18n/LocaleContext'
import { curatedHighlights } from '../lib/highlights'
import { loadCategories, loadSongs } from '../lib/data'
import { topGenres } from '../lib/analytics'
import type { Category, Song } from '../types'
import GenreCloud from '../visualizations/GenreCloud'

function HomePage() {
  const { t } = useLocale()
  const [songs, setSongs] = useState<Song[]>([])
  const [mostPlayed, setMostPlayed] = useState<Song | null>(null)
  const [topPantheon, setTopPantheon] = useState<Song | null>(null)
  const [categories, setCategories] = useState<Category[]>([])

  useEffect(() => {
    loadSongs().then((all) => {
      setSongs(all)

      const byPlays = [...all].sort((a, b) => b.listening.plays - a.listening.plays)
      setMostPlayed(byPlays[0] ?? null)

      const pantheon = all.filter((s) => s.personal.isPantheon)
      const ranked = pantheon.find((s) => s.personal.pantheonRank === 1)
      setTopPantheon(ranked ?? pantheon[0] ?? null)
    })
    loadCategories().then(setCategories)
  }, [])

  const highlights = curatedHighlights(songs, categories, 4)
  const pantheonGenres = topGenres(
    songs.filter((s) => s.personal.isPantheon),
    12,
  )

  return (
    <div className="flex flex-1 flex-col overflow-x-clip">
      <OpeningAnimation />
      <div className="relative flex flex-1 flex-col items-center justify-center overflow-hidden">
        <ParallaxLayer
          offset={60}
          className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.05]"
        >
          <div aria-hidden="true" className="h-[120vmax] w-[120vmax]">
            <AlbumArtPattern title="the" artist="pantheon" alt="" />
          </div>
        </ParallaxLayer>
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="relative flex flex-col items-center gap-6 px-6 py-14 sm:py-24 text-center"
        >
          <motion.h1
            variants={fadeUp}
            className="text-5xl tracking-tight sm:text-7xl"
          >
            {t('home.wordmark')}
          </motion.h1>
          <motion.p variants={fadeUp} className="max-w-md text-lg text-muted italic">
            {t('home.tagline1')}
            <br />
            <span className="text-foreground not-italic">{t('home.tagline2')}</span>
          </motion.p>
          <motion.p variants={fadeUp} className="max-w-md text-sm text-muted">
            {t('home.subtitle')}
          </motion.p>
        </motion.div>
      </div>

      {highlights.length > 0 && (
        <ParallaxLayer offset={16} className="border-t border-border">
          <motion.section
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-6 py-10 sm:py-16"
          >
            <motion.p variants={fadeUp} className="text-center text-sm tracking-wide text-muted uppercase">
              {t('home.highlightsHeading')}
            </motion.p>
            <motion.div variants={fadeUp} className="grid grid-cols-2 gap-6 sm:grid-cols-4">
              {highlights.map((song) => (
                <SongCard
                  key={song.id}
                  song={song}
                  showWhy
                  navState={{ songIds: highlights.map((s) => s.id), returnTo: '/' }}
                />
              ))}
            </motion.div>
          </motion.section>
        </ParallaxLayer>
      )}

      {pantheonGenres.length > 0 && (
        <ParallaxLayer offset={16} className="border-t border-border">
          <motion.section
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="mx-auto flex w-full max-w-3xl flex-col gap-2 px-6 py-10 sm:py-16"
          >
            <motion.p variants={fadeUp} className="text-center text-sm tracking-wide text-muted uppercase">
              {t('home.acrossGenresHeading')}
            </motion.p>
            <motion.div variants={fadeUp}>
              <GenreCloud genres={pantheonGenres} />
            </motion.div>
          </motion.section>
        </ParallaxLayer>
      )}

      {mostPlayed && topPantheon && (
        <ParallaxLayer offset={16} className="border-t border-border">
          <motion.section
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-6 py-10 sm:py-16"
          >
            <motion.p variants={fadeUp} className="text-center text-sm tracking-wide text-muted uppercase">
              {t('home.mostPlayedVsFavoriteHeading')}
            </motion.p>
            <motion.div variants={fadeUp} className="grid grid-cols-2 gap-6">
              <div className="flex flex-col items-center gap-2 text-center">
                <span className="text-xs tracking-wide text-muted uppercase">{t('home.mostPlayedLabel')}</span>
                <SongCard
                  song={mostPlayed}
                  navState={{ songIds: [mostPlayed.id, topPantheon.id], returnTo: '/' }}
                />
                <span className="text-sm text-muted">
                  {t('common.plays', { count: mostPlayed.listening.plays })}
                </span>
              </div>
              <div className="flex flex-col items-center gap-2 text-center">
                <span className="text-xs tracking-wide text-gold uppercase">{t('home.pantheonLabel')}</span>
                <SongCard
                  song={topPantheon}
                  navState={{ songIds: [mostPlayed.id, topPantheon.id], returnTo: '/' }}
                />
                <span className="text-sm text-muted">
                  {t('common.plays', { count: topPantheon.listening.plays })}
                </span>
              </div>
            </motion.div>
          </motion.section>
        </ParallaxLayer>
      )}

      <ParallaxLayer offset={16} className="border-t border-border">
        <motion.section
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-6 py-10 sm:py-16"
        >
          <motion.p variants={fadeUp} className="text-center text-sm tracking-wide text-muted uppercase">
            {t('home.exploreHeading')}
          </motion.p>
          <motion.div variants={fadeUp} className="flex flex-wrap justify-center gap-4">
            {categories.map((category) => (
              <Link key={category.id} to={`/pantheon?category=${category.id}`}>
                <CategoryCard category={category} />
              </Link>
            ))}
          </motion.div>
        </motion.section>
      </ParallaxLayer>
    </div>
  )
}

export default HomePage
