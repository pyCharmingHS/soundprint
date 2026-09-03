import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { fadeIn, fadeUp, staggerContainer } from '../animations/variants'
import CategoryCard from '../components/CategoryCard'
import SongCard from '../components/SongCard'
import { loadCategories, loadSongs } from '../lib/data'
import type { Category, Song } from '../types'

type BrowseMode = 'category' | 'genre'

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
  const [searchParams, setSearchParams] = useSearchParams()
  const activeCategory = searchParams.get('category')
  const activeGenre = searchParams.get('genre')
  const [browseMode, setBrowseMode] = useState<BrowseMode>(activeGenre ? 'genre' : 'category')

  useEffect(() => {
    loadCategories().then(setCategories)
    loadSongs().then((all) => setSongs(sortPantheon(all.filter((s) => s.personal.isPantheon))))
  }, [])

  const visibleSongs = activeGenre
    ? songs.filter((song) => song.genres.includes(activeGenre))
    : activeCategory
      ? songs.filter((song) => song.personal.categories.includes(activeCategory))
      : songs

  const activeCategoryData = categories.find((c) => c.id === activeCategory)
  const genres = [...new Set(songs.flatMap((s) => s.genres))].sort()

  function switchMode(mode: BrowseMode) {
    setBrowseMode(mode)
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      next.delete('category')
      next.delete('genre')
      return next
    })
  }

  function toggleCategory(categoryId: string) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      next.delete('genre')
      if (activeCategory === categoryId) {
        next.delete('category')
      } else {
        next.set('category', categoryId)
      }
      return next
    })
  }

  function toggleGenre(genre: string) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      next.delete('category')
      if (activeGenre === genre) {
        next.delete('genre')
      } else {
        next.set('genre', genre)
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
      <motion.div variants={fadeUp} className="flex flex-col gap-2 text-center">
        <h1 className="text-3xl sm:text-4xl">The Pantheon</h1>
        <p className="text-muted">
          Not ranked by plays. Ranked by what stays.
        </p>
      </motion.div>

      {/* Sticky so switching categories/genres never requires scrolling
          back up past the song grid. Only one pill row shows at a time
          (toggled below) to keep this compact on small screens. */}
      <motion.div
        variants={fadeUp}
        className="sticky top-0 z-10 -mx-6 flex flex-col gap-2 bg-ink/95 px-6 py-2 backdrop-blur sm:py-3"
      >
        <div className="flex items-center justify-center gap-2 text-xs tracking-wide uppercase">
          <span className="text-muted">Browse by</span>
          <button
            type="button"
            onClick={() => switchMode('category')}
            className={`cursor-pointer transition-colors ${
              browseMode === 'category' ? 'text-gold' : 'text-muted hover:text-foreground'
            }`}
          >
            Category
          </button>
          <span className="text-border">/</span>
          <button
            type="button"
            onClick={() => switchMode('genre')}
            className={`cursor-pointer transition-colors ${
              browseMode === 'genre' ? 'text-gold' : 'text-muted hover:text-foreground'
            }`}
          >
            Genre
          </button>
        </div>

        <div className="flex flex-nowrap items-center gap-2 overflow-x-auto sm:flex-wrap sm:justify-center sm:gap-3 sm:overflow-visible">
          {browseMode === 'category'
            ? categories.map((category) => (
                <CategoryCard
                  key={category.id}
                  category={category}
                  active={activeCategory === category.id}
                  onClick={() => toggleCategory(category.id)}
                />
              ))
            : genres.map((genre) => (
                <button
                  key={genre}
                  type="button"
                  onClick={() => toggleGenre(genre)}
                  className={`flex shrink-0 cursor-pointer items-center rounded-full border px-3 py-1.5 text-sm whitespace-nowrap transition-colors sm:px-4 sm:py-2 sm:text-base ${
                    activeGenre === genre
                      ? 'border-gold bg-gold/10 text-gold'
                      : 'border-border bg-surface hover:border-gold/50'
                  }`}
                >
                  {genre}
                </button>
              ))}
        </div>
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
                {activeCategoryData.description}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      )}

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
