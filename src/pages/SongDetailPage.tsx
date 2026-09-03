import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { fadeUp, staggerContainer } from '../animations/variants'
import AlbumArt from '../components/AlbumArt'
import StatBar from '../components/StatBar'
import { formatDate, formatHourLabel, formatHours, mostCommonKey } from '../lib/format'
import { loadCategories, loadSongs } from '../lib/data'
import { streamingLinks } from '../lib/streaming'
import type { Category, Song } from '../types'

function SongDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [song, setSong] = useState<Song | null | undefined>(undefined)
  const [categories, setCategories] = useState<Category[]>([])

  useEffect(() => {
    loadSongs().then((songs) => setSong(songs.find((s) => s.id === id) ?? null))
    loadCategories().then(setCategories)
  }, [id])

  if (song === undefined) return null

  if (song === null) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-muted">Song not found.</p>
      </div>
    )
  }

  const { personal, listening } = song
  const mostActiveDay = mostCommonKey(listening.playsByDay)
  const mostActiveHour = mostCommonKey(listening.playsByHour)
  const categoryById = new Map(categories.map((c) => [c.id, c]))

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-10 px-6 py-16"
    >
      <motion.button
        type="button"
        variants={fadeUp}
        onClick={() => navigate(-1)}
        className="flex w-fit cursor-pointer items-center gap-1 text-sm text-muted transition-colors hover:text-gold"
      >
        ← Back
      </motion.button>

      <motion.div variants={fadeUp} className="flex flex-col items-center gap-4 text-center">
        <AlbumArt
          src={song.artwork}
          title={song.title}
          artist={song.artist}
          className="w-48"
        />
        <div>
          <h1 className="text-3xl">{song.title}</h1>
          <p className="text-muted">{song.artist}</p>
        </div>
        {personal.isPantheon && (
          <span className="text-sm tracking-wide text-gold">
            🏛️ PANTHEON{personal.pantheonRank ? ` — #${personal.pantheonRank}` : ''}
          </span>
        )}
        <div className="flex flex-wrap justify-center gap-2">
          {streamingLinks(song).map((link) => (
            <a
              key={link.label}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-border px-3 py-1 text-sm text-muted transition-colors hover:border-gold hover:text-gold"
            >
              {link.label}
            </a>
          ))}
        </div>
      </motion.div>

      {personal.why && (
        <motion.div variants={fadeUp} className="flex flex-col gap-2 border-t border-border pt-8">
          <h2 className="text-sm tracking-wide text-muted uppercase">Why it's here</h2>
          <p className="text-lg italic">"{personal.why}"</p>
          {personal.memories && (
            <p className="text-sm text-muted">{personal.memories}</p>
          )}
        </motion.div>
      )}

      {(personal.rating !== undefined ||
        personal.emotionalIntensity !== undefined ||
        personal.nostalgia !== undefined ||
        personal.meaning !== undefined) && (
        <motion.div variants={fadeUp} className="flex flex-col gap-2 border-t border-border pt-8">
          <h2 className="text-sm tracking-wide text-muted uppercase">Emotional Profile</h2>
          <div className="flex flex-col gap-1.5">
            {personal.rating !== undefined && (
              <StatBar label="Rating" value={personal.rating} max={10} />
            )}
            {personal.emotionalIntensity !== undefined && (
              <StatBar label="Intensity" value={personal.emotionalIntensity} max={10} />
            )}
            {personal.nostalgia !== undefined && (
              <StatBar label="Nostalgia" value={personal.nostalgia} max={10} />
            )}
            {personal.meaning !== undefined && (
              <StatBar label="Meaning" value={personal.meaning} max={10} />
            )}
          </div>
        </motion.div>
      )}

      <motion.div variants={fadeUp} className="flex flex-col gap-2 border-t border-border pt-8">
        <h2 className="text-sm tracking-wide text-muted uppercase">My Listening</h2>
        <p>
          {listening.plays} plays · {formatHours(listening.minutes)}
        </p>
        {listening.firstListened && (
          <p className="text-sm text-muted">
            First heard: {formatDate(listening.firstListened)}
          </p>
        )}
        {listening.lastListened && (
          <p className="text-sm text-muted">
            Last heard: {formatDate(listening.lastListened)}
          </p>
        )}
        {(mostActiveDay || mostActiveHour) && (
          <p className="text-sm text-muted">
            Most commonly played:{' '}
            {[mostActiveDay, mostActiveHour && formatHourLabel(mostActiveHour)]
              .filter(Boolean)
              .join(', ')}
          </p>
        )}
      </motion.div>

      {personal.categories.length > 0 && (
        <motion.div variants={fadeUp} className="flex flex-col gap-2 border-t border-border pt-8">
          <h2 className="text-sm tracking-wide text-muted uppercase">Categories</h2>
          <div className="flex flex-wrap gap-2">
            {personal.categories.map((categoryId) => {
              const category = categoryById.get(categoryId)
              return (
                <Link
                  key={categoryId}
                  to={`/pantheon?category=${categoryId}`}
                  className="rounded-full border border-border bg-surface px-3 py-1 text-sm transition-colors hover:border-gold hover:text-gold"
                >
                  {category ? `${category.emoji} ${category.name}` : categoryId}
                </Link>
              )
            })}
          </div>
        </motion.div>
      )}

      {personal.tags.length > 0 && (
        <motion.div variants={fadeUp} className="flex flex-col gap-2 border-t border-border pt-8">
          <h2 className="text-sm tracking-wide text-muted uppercase">Tags</h2>
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
  )
}

export default SongDetailPage
