#!/usr/bin/env node
// One-time (or re-run-as-needed) enrichment: fills in `artwork` for any song
// in songs.json that doesn't have one yet, using the iTunes Search API
// (free, no auth, CORS-friendly — but this runs at build/curation time, not
// in the browser, so that doesn't even matter here). Upgrades the default
// 100x100 artwork to 600x600.
//
// Run with: npm run fetch-artwork
// Add --dry-run to preview matches without writing songs.json.

import { readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const songsPath = path.join(__dirname, '..', 'src', 'data', 'public', 'songs.json')
const dryRun = process.argv.includes('--dry-run')

function normalize(text) {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // strip accents
    .replace(/[^a-z0-9]+/gi, ' ')
    .trim()
    .toLowerCase()
}

// "Chris Brown feat. Busta Rhymes & Lil Wayne" -> "Chris Brown"
function primaryArtist(artist) {
  return artist.split(/\s+(?:feat\.?|ft\.?|&|,)\s+/i)[0]
}

async function searchArtwork(title, artist) {
  const term = encodeURIComponent(`${title} ${primaryArtist(artist)}`)
  const url = `https://itunes.apple.com/search?term=${term}&entity=song&limit=10`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`iTunes search failed: ${res.status}`)
  const { results } = await res.json()

  const wantArtist = normalize(primaryArtist(artist))
  const wantTitle = normalize(title)

  const match =
    results.find(
      (r) => normalize(r.artistName).includes(wantArtist) && normalize(r.trackName).includes(wantTitle),
    ) ?? results.find((r) => normalize(r.artistName).includes(wantArtist))

  if (!match?.artworkUrl100) return null
  return {
    url: match.artworkUrl100.replace('100x100bb', '600x600bb'),
    matchedTrack: `${match.trackName} — ${match.artistName}`,
    exact: !!results.find(
      (r) => normalize(r.artistName).includes(wantArtist) && normalize(r.trackName).includes(wantTitle),
    ),
  }
}

async function run() {
  const songs = JSON.parse(readFileSync(songsPath, 'utf-8'))
  const needsArtwork = songs.filter((s) => !s.artwork)

  if (needsArtwork.length === 0) {
    console.log('Every song already has artwork.')
    return
  }

  console.log(`Looking up artwork for ${needsArtwork.length} song(s)...\n`)
  let updated = 0

  for (const song of needsArtwork) {
    try {
      const result = await searchArtwork(song.title, song.artist)
      if (!result) {
        console.log(`✗ ${song.title.padEnd(28)} no iTunes match found`)
        continue
      }
      const flag = result.exact ? '✓' : '~'
      console.log(
        `${flag} ${song.title.padEnd(28)} -> ${result.matchedTrack}${result.exact ? '' : '  (fuzzy match — verify)'}`,
      )
      if (!dryRun) {
        song.artwork = result.url
        updated++
      }
    } catch (err) {
      console.log(`✗ ${song.title.padEnd(28)} ${err.message}`)
    }
    // Be polite to the (undocumented, unofficial-rate-limit) iTunes API.
    await new Promise((r) => setTimeout(r, 300))
  }

  if (dryRun) {
    console.log('\n--dry-run: songs.json not written.')
    return
  }

  if (updated > 0) {
    writeFileSync(songsPath, JSON.stringify(songs, null, 2) + '\n')
    console.log(`\nUpdated ${updated} song(s) in songs.json.`)
  }
}

run()
