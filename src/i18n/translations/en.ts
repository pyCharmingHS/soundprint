import type { TranslationValue } from './types'

// Source of truth for every UI string in the app. es/it/pt each type-check
// against `Record<TranslationKey, TranslationValue>`, so a missing or
// misspelled key in any of them is a compile error, not a silent gap.
const en = {
  'nav.home': 'Home',
  'nav.pantheon': 'Pantheon',
  'nav.statistics': 'Statistics',

  'home.wordmark': 'THE PANTHEON',
  'home.tagline1': "I don't have a favorite song.",
  'home.tagline2': 'I have several.',
  'home.subtitle': 'Organized by why each one matters to me — not genre, not rank.',
  'home.highlightsHeading': 'A few, to start',
  'home.acrossGenresHeading': 'Across genres',
  'home.mostPlayedVsFavoriteHeading': 'Most played ≠ favorite',
  'home.mostPlayedLabel': 'Most Played',
  'home.pantheonLabel': 'Pantheon',
  'home.exploreHeading': 'Explore the Pantheon',

  'pantheon.title': 'The Pantheon',
  'pantheon.subtitle': 'Not ranked by plays. Ranked by what stays.',
  'pantheon.browseBy': 'Browse by',
  'pantheon.category': 'Category',
  'pantheon.genre': 'Genre',
  'pantheon.emotionalLandscapeHeading': 'Emotional Landscape',
  'pantheon.emotionalLandscapeCaption': "How the Pantheon feels, not just what's in it.",

  'statistics.title': 'Statistics',
  'statistics.subtitle': 'What I actually do, not what I value.',
  'statistics.plays': 'Plays',
  'statistics.listened': 'Listened',
  'statistics.artists': 'Artists',
  'statistics.albums': 'Albums',
  'statistics.currentObsession': 'Current Obsession',
  'statistics.pantheonVsReality': 'Pantheon vs. Reality',
  'statistics.pantheonVsRealityCaption':
    'Sorted by plays. Color shows what actually made the Pantheon.',
  'statistics.mostPlayed': 'Most Played',
  'statistics.topArtists': 'Top Artists',
  'statistics.topGenres': 'Top Genres',
  'statistics.dayOfWeek': 'Day of Week',
  'statistics.timeOfDay': 'Time of Day',
  'statistics.discoveryTimeline': 'Discovery Timeline',
  'statistics.discoveryTimelineCaption': 'Songs discovered and plays accumulated, by year.',
  'statistics.musicalEvolution': 'Musical Evolution',
  'statistics.musicalEvolutionCaption': 'Genres entering the collection, year by year.',
  'statistics.replayIntensity': 'Replay Intensity',
  'statistics.replayIntensityCaption': 'Plays per day since first heard.',
  'statistics.pantheonCandidates': 'Pantheon Candidates',
  'statistics.pantheonCandidatesCaption':
    "A discovery signal, not a decision — these songs behave like Pantheon songs but haven't been added.",

  'song.back': 'Back',
  'song.pantheonBadge': 'PANTHEON',
  'song.whyHeading': "Why it's here",
  'song.emotionalProfileHeading': 'Emotional Profile',
  'song.rating': 'Rating',
  'song.intensity': 'Intensity',
  'song.nostalgia': 'Nostalgia',
  'song.meaning': 'Meaning',
  'song.myListeningHeading': 'My Listening',
  'song.firstHeard': 'First heard:',
  'song.lastHeard': 'Last heard:',
  'song.mostCommonlyPlayed': 'Most commonly played:',
  'song.categoriesHeading': 'Categories',
  'song.tagsHeading': 'Tags',
  'song.notFound': 'Song not found.',

  'common.plays': { one: '{{count}} play', other: '{{count}} plays' },
  'common.songs': { one: '{{count}} song', other: '{{count}} songs' },
  'common.hoursUnit': 'hours',
  'common.by': '{{title}} by {{artist}}',

  'viz.pantheonLegend': 'Pantheon',
  'viz.notYetLegend': 'Not (yet)',
  'viz.meaningAxis': 'Meaning →',
  'viz.intensityAxis': 'Intensity →',
  'viz.emotionalLandscapeLegend': 'Size = nostalgia · Brightness = rating',

  'weekday.Monday': 'Monday',
  'weekday.Tuesday': 'Tuesday',
  'weekday.Wednesday': 'Wednesday',
  'weekday.Thursday': 'Thursday',
  'weekday.Friday': 'Friday',
  'weekday.Saturday': 'Saturday',
  'weekday.Sunday': 'Sunday',

  'languagePicker.ariaLabel': 'Change language',
} satisfies Record<string, TranslationValue>

export default en
export type TranslationKey = keyof typeof en
