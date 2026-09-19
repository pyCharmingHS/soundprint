import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { fadeUp, staggerContainer } from '../animations/variants'
import ParallaxLayer from '../components/ParallaxLayer'
import RankRow from '../components/RankRow'
import StatBar from '../components/StatBar'
import WorkInProgressBadge from '../components/WorkInProgressBadge'
import { useLocale } from '../i18n/LocaleContext'
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
  const { t, locale } = useLocale()
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
      <ParallaxLayer offset={20}>
        <motion.div variants={fadeUp} className="flex flex-col items-center gap-2 text-center">
          <WorkInProgressBadge />
          <h1 className="text-4xl">{t('statistics.title')}</h1>
          <p className="text-muted">{t('statistics.subtitle')}</p>
          <p className="max-w-md text-sm text-muted">{t('statistics.wipCaption')}</p>
        </motion.div>
      </ParallaxLayer>

      <motion.div variants={fadeUp} className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="flex flex-col items-center gap-1 rounded-sm border border-border bg-surface py-4">
          <span className="text-2xl">{totals.totalPlays}</span>
          <span className="text-xs text-muted uppercase">{t('statistics.plays')}</span>
        </div>
        <div className="flex flex-col items-center gap-1 rounded-sm border border-border bg-surface py-4">
          <span className="text-2xl">
            {formatHours(totals.totalMinutes)} {t('common.hoursUnit')}
          </span>
          <span className="text-xs text-muted uppercase">{t('statistics.listened')}</span>
        </div>
        <div className="flex flex-col items-center gap-1 rounded-sm border border-border bg-surface py-4">
          <span className="text-2xl">{totals.artistCount}</span>
          <span className="text-xs text-muted uppercase">{t('statistics.artists')}</span>
        </div>
        <div className="flex flex-col items-center gap-1 rounded-sm border border-border bg-surface py-4">
          <span className="text-2xl">{totals.albumCount}</span>
          <span className="text-xs text-muted uppercase">{t('statistics.albums')}</span>
        </div>
      </motion.div>

      {obsession && (
        <motion.div variants={fadeUp} className="flex flex-col gap-2 border-t border-border pt-8">
          <SectionHeading>{t('statistics.currentObsession')}</SectionHeading>
          <RankRow
            rank={1}
            primary={obsession.title}
            secondary={obsession.artist}
            value={t('common.plays', { count: obsession.listening.plays })}
            href={`/song/${obsession.id}`}
          />
        </motion.div>
      )}

      <motion.div variants={fadeUp} className="flex flex-col gap-2 border-t border-border pt-8">
        <SectionHeading>{t('statistics.pantheonVsReality')}</SectionHeading>
        <p className="text-sm text-muted">{t('statistics.pantheonVsRealityCaption')}</p>
        <PantheonVsReality songs={songs} />
      </motion.div>

      <motion.div variants={fadeUp} className="flex flex-col gap-1 border-t border-border pt-8">
        <SectionHeading>{t('statistics.mostPlayed')}</SectionHeading>
        {topSongsByPlays(songs).map((song, i) => (
          <RankRow
            key={song.id}
            rank={i + 1}
            primary={song.title}
            secondary={song.artist}
            value={t('common.plays', { count: song.listening.plays })}
            href={`/song/${song.id}`}
          />
        ))}
      </motion.div>

      <motion.div variants={fadeUp} className="flex flex-col gap-1 border-t border-border pt-8">
        <SectionHeading>{t('statistics.topArtists')}</SectionHeading>
        {topArtists(songs).map((artist, i) => (
          <RankRow
            key={artist.artist}
            rank={i + 1}
            primary={artist.artist}
            secondary={t('common.songs', { count: artist.songCount })}
            value={t('common.plays', { count: artist.plays })}
          />
        ))}
      </motion.div>

      <motion.div variants={fadeUp} className="flex flex-col gap-1 border-t border-border pt-8">
        <SectionHeading>{t('statistics.topGenres')}</SectionHeading>
        {topGenres(songs).map((genre, i) => (
          <RankRow
            key={genre.genre}
            rank={i + 1}
            primary={genre.genre}
            secondary={t('common.songs', { count: genre.songCount })}
            value={t('common.plays', { count: genre.plays })}
          />
        ))}
        <GenreCloud genres={topGenres(songs, 10)} />
      </motion.div>

      <motion.div variants={fadeUp} className="flex flex-col gap-4 border-t border-border pt-8">
        <SectionHeading>{t('statistics.dayOfWeek')}</SectionHeading>
        <div className="flex flex-col gap-1.5">
          {WEEKDAYS.map((day) => (
            <StatBar key={day} label={t(`weekday.${day}`)} value={byDay[day] ?? 0} max={maxDayPlays} />
          ))}
        </div>
      </motion.div>

      <motion.div variants={fadeUp} className="flex flex-col gap-4 border-t border-border pt-8">
        <SectionHeading>{t('statistics.timeOfDay')}</SectionHeading>
        <div className="flex flex-col gap-1.5">
          {Object.entries(byHour)
            .filter(([, plays]) => plays > 0)
            .sort((a, b) => Number(a[0]) - Number(b[0]))
            .map(([hour, plays]) => (
              <StatBar
                key={hour}
                label={formatHourLabel(hour, locale)}
                value={plays}
                max={maxHourPlays}
              />
            ))}
        </div>
        <ListeningClock hours={byHour} />
      </motion.div>

      <motion.div variants={fadeUp} className="flex flex-col gap-4 border-t border-border pt-8">
        <SectionHeading>{t('statistics.discoveryTimeline')}</SectionHeading>
        <p className="text-sm text-muted">{t('statistics.discoveryTimelineCaption')}</p>
        <TimelineChart entries={timeline} />
      </motion.div>

      <motion.div variants={fadeUp} className="flex flex-col gap-4 border-t border-border pt-8">
        <SectionHeading>{t('statistics.musicalEvolution')}</SectionHeading>
        <p className="text-sm text-muted">{t('statistics.musicalEvolutionCaption')}</p>
        <MusicalEvolution entries={evolution} />
      </motion.div>

      <motion.div variants={fadeUp} className="flex flex-col gap-1 border-t border-border pt-8">
        <SectionHeading>{t('statistics.replayIntensity')}</SectionHeading>
        <p className="text-sm text-muted">{t('statistics.replayIntensityCaption')}</p>
        {topByReplayIntensity(songs).map((song, i) => (
          <RankRow
            key={song.id}
            rank={i + 1}
            primary={song.title}
            secondary={song.artist}
            value={t('common.plays', { count: song.listening.plays })}
            href={`/song/${song.id}`}
          />
        ))}
      </motion.div>

      {candidates.length > 0 && (
        <motion.div variants={fadeUp} className="flex flex-col gap-1 border-t border-border pt-8">
          <SectionHeading>{t('statistics.pantheonCandidates')}</SectionHeading>
          <p className="text-sm text-muted">{t('statistics.pantheonCandidatesCaption')}</p>
          {candidates.map(({ song }, i) => (
            <RankRow
              key={song.id}
              rank={i + 1}
              primary={song.title}
              secondary={song.artist}
              value={t('common.plays', { count: song.listening.plays })}
              href={`/song/${song.id}`}
            />
          ))}
        </motion.div>
      )}
    </motion.div>
  )
}

export default StatisticsPage
