# Local data pipeline

Turns raw personal listening exports into the curated public data the
site actually ships (`src/data/public/songs.json`). Everything raw or
intermediate lives under `.local/`, which is gitignored and never
committed — only the final curated JSON is public.

```
.local/apple/*.json, .local/youtube/*.json   (you drop raw exports here)
        |
        v
  import_apple.py, import_youtube.py   -> .local/events/<platform>.json
        |                                  .local/imports/<job>.json
        v
  normalize.py                         -> .local/normalized/events.json
        |                                  .local/normalized/new-songs.json
        v
  analyze.py                           -> .local/analysis/listening-stats.json
        |
        v
  generate_public_data.py              -> src/data/public/songs.json
```

Run the whole thing with `npm run update-data`, or run any stage on
its own with `python -m scripts.<stage_name>` (e.g.
`python -m scripts.normalize`) from the repo root. Every stage is
idempotent — re-running is always safe.

## Input formats are placeholders

Neither Apple's actual personal-data export/API shape nor which
YouTube export ends up being the real source has been investigated
yet — that's Phase 7 (VISION.md sections 23-24). Until then,
`import_apple.py` and `import_youtube.py` each define a documented
placeholder JSON shape in their module docstrings. When Phase 7 lands
real export files, only `parse_file()` in those two scripts should
need to change — everything downstream (normalize, analyze, generate)
is already platform-agnostic.

## Song matching

`normalize.py` resolves each raw play to a canonical song using the
hierarchy from VISION.md section 25: platform ID, then exact
artist+title, then normalized (punctuation/suffix-stripped)
artist+title, then fuzzy matching above an 0.85 similarity threshold.
Anything that doesn't clear that bar is treated as a new song rather
than force-merged — known limitation: fuzzy matches aren't currently
queued for manual confirmation, they're applied automatically.

## Idempotency

Every raw play gets a deterministic id (hash of platform, source id,
timestamp, artist, title), so importing the same export file twice
never creates duplicate events — `recordsSkipped` in the printed
summary reflects that.

## Curation is never overwritten

`generate_public_data.py` only ever replaces a song's `listening`
block. `personal` (categories, tags, `why`, Pantheon status, ...) and
objective metadata you've hand-edited (artwork, album, genres) are
left exactly as they are. New songs discovered from real listening
history are added with blank `personal` curation, for a human to fill
in.
