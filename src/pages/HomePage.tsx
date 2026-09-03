import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fadeUp, staggerContainer } from '../animations/variants'
import CategoryCard from '../components/CategoryCard'
import SongCard from '../components/SongCard'
import { curatedHighlights } from '../lib/highlights'
import { loadCategories, loadSongs } from '../lib/data'
import { topGenres } from '../lib/analytics'
import type { Category, Song } from '../types'
import GenreCloud from '../visualizations/GenreCloud'

function HomePage() {
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
    <div className="flex flex-1 flex-col">
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-24 text-center"
      >
        <motion.h1
          variants={fadeUp}
          className="text-5xl tracking-tight sm:text-7xl"
        >
          THE PANTHEON
        </motion.h1>
        <motion.p variants={fadeUp} className="max-w-md text-lg text-muted italic">
          I don't have a favorite song.
          <br />
          <span className="text-foreground not-italic">I have several.</span>
        </motion.p>
        <motion.p variants={fadeUp} className="max-w-md text-sm text-muted">
          Organized by why each one matters to me — not genre, not rank.
        </motion.p>
      </motion.div>

      {highlights.length > 0 && (
        <motion.section
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="mx-auto flex w-full max-w-4xl flex-col gap-6 border-t border-border px-6 py-16"
        >
          <motion.p variants={fadeUp} className="text-center text-sm tracking-wide text-muted uppercase">
            A few, to start
          </motion.p>
          <motion.div variants={fadeUp} className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            {highlights.map((song) => (
              <SongCard key={song.id} song={song} showWhy />
            ))}
          </motion.div>
        </motion.section>
      )}

      {pantheonGenres.length > 0 && (
        <motion.section
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="mx-auto flex w-full max-w-3xl flex-col gap-2 border-t border-border px-6 py-16"
        >
          <motion.p variants={fadeUp} className="text-center text-sm tracking-wide text-muted uppercase">
            Across genres
          </motion.p>
          <motion.div variants={fadeUp}>
            <GenreCloud genres={pantheonGenres} />
          </motion.div>
        </motion.section>
      )}

      {mostPlayed && topPantheon && (
        <motion.section
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="mx-auto flex w-full max-w-3xl flex-col gap-6 border-t border-border px-6 py-16"
        >
          <motion.p variants={fadeUp} className="text-center text-sm tracking-wide text-muted uppercase">
            Most played ≠ favorite
          </motion.p>
          <motion.div variants={fadeUp} className="grid grid-cols-2 gap-6">
            <div className="flex flex-col items-center gap-2 text-center">
              <span className="text-xs tracking-wide text-muted uppercase">Most Played</span>
              <SongCard song={mostPlayed} />
              <span className="text-sm text-muted">{mostPlayed.listening.plays} plays</span>
            </div>
            <div className="flex flex-col items-center gap-2 text-center">
              <span className="text-xs tracking-wide text-gold uppercase">Pantheon</span>
              <SongCard song={topPantheon} />
              <span className="text-sm text-muted">{topPantheon.listening.plays} plays</span>
            </div>
          </motion.div>
        </motion.section>
      )}

      <motion.section
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="mx-auto flex w-full max-w-3xl flex-col gap-6 border-t border-border px-6 py-16"
      >
        <motion.p variants={fadeUp} className="text-center text-sm tracking-wide text-muted uppercase">
          Explore the Pantheon
        </motion.p>
        <motion.div variants={fadeUp} className="flex flex-wrap justify-center gap-4">
          {categories.map((category) => (
            <Link key={category.id} to={`/pantheon?category=${category.id}`}>
              <CategoryCard category={category} />
            </Link>
          ))}
        </motion.div>
      </motion.section>
    </div>
  )
}

export default HomePage
