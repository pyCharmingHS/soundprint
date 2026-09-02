import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { fadeIn, fadeUp, staggerContainer } from '../animations/variants'
import CategoryCard from '../components/CategoryCard'
import SongCard from '../components/SongCard'
import { loadCategories, loadSongs } from '../lib/data'
import type { Category, Song } from '../types'

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

function PantheonPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [songs, setSongs] = useState<Song[]>([])
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  useEffect(() => {
    loadCategories().then(setCategories)
    loadSongs().then((all) => setSongs(sortPantheon(all.filter((s) => s.personal.isPantheon))))
  }, [])

  const visibleSongs = activeCategory
    ? songs.filter((song) => song.personal.categories.includes(activeCategory))
    : songs

  const activeCategoryData = categories.find((c) => c.id === activeCategory)

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-10 px-6 py-16"
    >
      <motion.div variants={fadeUp} className="flex flex-col gap-2 text-center">
        <h1 className="text-4xl">The Pantheon</h1>
        <p className="text-muted">
          Not ranked by plays. Ranked by what stays.
        </p>
      </motion.div>

      <motion.div variants={fadeUp} className="flex flex-wrap justify-center gap-4">
        {categories.map((category) => (
          <CategoryCard
            key={category.id}
            category={category}
            active={activeCategory === category.id}
            onClick={() =>
              setActiveCategory((current) =>
                current === category.id ? null : category.id,
              )
            }
          />
        ))}
      </motion.div>

      <AnimatePresence mode="wait">
        {activeCategoryData?.description && (
          <motion.p
            key={activeCategoryData.id}
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="mx-auto max-w-md text-center text-muted"
          >
            {activeCategoryData.description}
          </motion.p>
        )}
      </AnimatePresence>

      <motion.div
        variants={fadeUp}
        className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4"
      >
        {visibleSongs.map((song) => (
          <SongCard key={song.id} song={song} />
        ))}
      </motion.div>
    </motion.div>
  )
}

export default PantheonPage
