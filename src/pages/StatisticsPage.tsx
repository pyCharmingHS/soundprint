import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { fadeUp, staggerContainer } from '../animations/variants'
import RankRow from '../components/RankRow'
import StatBar from '../components/StatBar'
import {
  aggregateByDay,
  aggregateByHour,
  computeTotals,
  discoveryTimeline,
  findCurrentObsession,
  genresByYear,
  pantheonCandidates,
  topArtists,
  topByReplayIntensity,
  topGenres,
  topSongsByPlays,
  WEEKDAYS,
} from '../lib/analytics'
import { formatHourLabel, formatHours } from '../lib/format'
import { loadSongs } from '../lib/data'
import type { Song } from '../types'
import GenreCloud from '../visualizations/GenreCloud'
import ListeningClock from '../visualizations/ListeningClock'
import MusicalEvolution from '../visualizations/MusicalEvolution'
import PantheonVsReality from '../visualizations/PantheonVsReality'
import TimelineChart from '../visualizations/TimelineChart'

function SectionHeading({ children }: { children: string }) {
  return (
    <h2 className="text-sm tracking-wide text-muted uppercase">{children}</h2>
  )
}

function StatisticsPage() {
  const [songs, setSongs] = useState<Song[] | null>(null)

  useEffect(() => {
    loadSongs().then(setSongs)
  }, [])

  if (!songs) return null

  const totals = computeTotals(songs)
  const byHour = aggregateByHour(songs)
  const byDay = aggregateByDay(songs)
  const maxHourPlays = Math.max(...Object.values(byHour))
  const maxDayPlays = Math.max(...Object.values(byDay))
  const timeline = discoveryTimeline(songs)
  const evolution = genresByYear(songs)
  const obsession = findCurrentObsession(songs)
  const candidates = pantheonCandidates(songs)

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-12 px-6 py-16"
    >
      <motion.div variants={fadeUp} className="flex flex-col gap-2 text-center">
        <h1 className="text-4xl">Statistics</h1>
        <p className="text-muted">What I actually do, not what I value.</p>
      </motion.div>

      <motion.div variants={fadeUp} className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="flex flex-col items-center gap-1 rounded-sm border border-border bg-surface py-4">
          <span className="text-2xl">{totals.totalPlays}</span>
          <span className="text-xs text-muted uppercase">Plays</span>
        </div>
        <div className="flex flex-col items-center gap-1 rounded-sm border border-border bg-surface py-4">
          <span className="text-2xl">{formatHours(totals.totalMinutes)}</span>
          <span className="text-xs text-muted uppercase">Listened</span>
        </div>
        <div className="flex flex-col items-center gap-1 rounded-sm border border-border bg-surface py-4">
          <span className="text-2xl">{totals.artistCount}</span>
          <span className="text-xs text-muted uppercase">Artists</span>
        </div>
        <div className="flex flex-col items-center gap-1 rounded-sm border border-border bg-surface py-4">
          <span className="text-2xl">{totals.albumCount}</span>
          <span className="text-xs text-muted uppercase">Albums</span>
        </div>
      </motion.div>

      {obsession && (
        <motion.div variants={fadeUp} className="flex flex-col gap-2 border-t border-border pt-8">
          <SectionHeading>Current Obsession</SectionHeading>
          <RankRow
            rank={1}
            primary={obsession.title}
            secondary={obsession.artist}
            value={`${obsession.listening.plays} plays`}
            href={`/song/${obsession.id}`}
          />
        </motion.div>
      )}

      <motion.div variants={fadeUp} className="flex flex-col gap-2 border-t border-border pt-8">
        <SectionHeading>Pantheon vs. Reality</SectionHeading>
        <p className="text-sm text-muted">
          Sorted by plays. Color shows what actually made the Pantheon.
        </p>
        <PantheonVsReality songs={songs} />
      </motion.div>

      <motion.div variants={fadeUp} className="flex flex-col gap-1 border-t border-border pt-8">
        <SectionHeading>Most Played</SectionHeading>
        {topSongsByPlays(songs).map((song, i) => (
          <RankRow
            key={song.id}
            rank={i + 1}
            primary={song.title}
            secondary={song.artist}
            value={`${song.listening.plays} plays`}
            href={`/song/${song.id}`}
          />
        ))}
      </motion.div>

      <motion.div variants={fadeUp} className="flex flex-col gap-1 border-t border-border pt-8">
        <SectionHeading>Top Artists</SectionHeading>
        {topArtists(songs).map((artist, i) => (
          <RankRow
            key={artist.artist}
            rank={i + 1}
            primary={artist.artist}
            secondary={`${artist.songCount} song${artist.songCount === 1 ? '' : 's'}`}
            value={`${artist.plays} plays`}
          />
        ))}
      </motion.div>

      <motion.div variants={fadeUp} className="flex flex-col gap-1 border-t border-border pt-8">
        <SectionHeading>Top Genres</SectionHeading>
        {topGenres(songs).map((genre, i) => (
          <RankRow
            key={genre.genre}
            rank={i + 1}
            primary={genre.genre}
            secondary={`${genre.songCount} song${genre.songCount === 1 ? '' : 's'}`}
            value={`${genre.plays} plays`}
          />
        ))}
        <GenreCloud genres={topGenres(songs, 10)} />
      </motion.div>

      <motion.div variants={fadeUp} className="flex flex-col gap-4 border-t border-border pt-8">
        <SectionHeading>Day of Week</SectionHeading>
        <div className="flex flex-col gap-1.5">
          {WEEKDAYS.map((day) => (
            <StatBar key={day} label={day} value={byDay[day] ?? 0} max={maxDayPlays} />
          ))}
        </div>
      </motion.div>

      <motion.div variants={fadeUp} className="flex flex-col gap-4 border-t border-border pt-8">
        <SectionHeading>Time of Day</SectionHeading>
        <div className="flex flex-col gap-1.5">
          {Object.entries(byHour)
            .filter(([, plays]) => plays > 0)
            .sort((a, b) => Number(a[0]) - Number(b[0]))
            .map(([hour, plays]) => (
              <StatBar key={hour} label={formatHourLabel(hour)} value={plays} max={maxHourPlays} />
            ))}
        </div>
        <ListeningClock hours={byHour} />
      </motion.div>

      <motion.div variants={fadeUp} className="flex flex-col gap-4 border-t border-border pt-8">
        <SectionHeading>Discovery Timeline</SectionHeading>
        <p className="text-sm text-muted">Songs discovered and plays accumulated, by year.</p>
        <TimelineChart entries={timeline} />
      </motion.div>

      <motion.div variants={fadeUp} className="flex flex-col gap-4 border-t border-border pt-8">
        <SectionHeading>Musical Evolution</SectionHeading>
        <p className="text-sm text-muted">Genres entering the collection, year by year.</p>
        <MusicalEvolution entries={evolution} />
      </motion.div>

      <motion.div variants={fadeUp} className="flex flex-col gap-1 border-t border-border pt-8">
        <SectionHeading>Replay Intensity</SectionHeading>
        <p className="text-sm text-muted">Plays per day since first heard.</p>
        {topByReplayIntensity(songs).map((song, i) => (
          <RankRow
            key={song.id}
            rank={i + 1}
            primary={song.title}
            secondary={song.artist}
            value={`${song.listening.plays} plays`}
            href={`/song/${song.id}`}
          />
        ))}
      </motion.div>

      {candidates.length > 0 && (
        <motion.div variants={fadeUp} className="flex flex-col gap-1 border-t border-border pt-8">
          <SectionHeading>Pantheon Candidates</SectionHeading>
          <p className="text-sm text-muted">
            A discovery signal, not a decision — these songs behave like Pantheon
            songs but haven't been added.
          </p>
          {candidates.map(({ song }, i) => (
            <RankRow
              key={song.id}
              rank={i + 1}
              primary={song.title}
              secondary={song.artist}
              value={`${song.listening.plays} plays`}
              href={`/song/${song.id}`}
            />
          ))}
        </motion.div>
      )}
    </motion.div>
  )
}

export default StatisticsPage
