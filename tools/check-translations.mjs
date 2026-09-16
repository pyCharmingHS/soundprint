#!/usr/bin/env node
// Reports which locales still need a "why" translation for each Pantheon
// song. `why` is the one field every song is expected to have curated
// prose for (that's the whole point of the site); an empty string in
// songs.json is a placeholder slot waiting to be filled in — see
// src/i18n/LocaleContext.tsx, which treats an empty slot the same as an
// absent one and falls back to English.
//
// Run with: npm run check-translations

import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const LOCALES = ['en', 'es', 'it', 'pt']

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const songsPath = path.join(__dirname, '..', 'src', 'data', 'public', 'songs.json')
const songs = JSON.parse(readFileSync(songsPath, 'utf-8'))

let totalMissing = 0

console.log('"why" translation coverage:\n')

for (const song of songs) {
  const why = song.personal?.why ?? {}
  const missing = LOCALES.filter((locale) => !(why[locale] ?? '').trim())
  totalMissing += missing.length

  const status = missing.length === 0 ? '✓ complete' : `missing: ${missing.join(', ')}`
  console.log(`${song.title.padEnd(28)} ${status}`)
}

console.log(`\n${totalMissing} translation${totalMissing === 1 ? '' : 's'} still needed.`)

process.exitCode = totalMissing > 0 ? 1 : 0
