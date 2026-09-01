"""Resolve raw plays from every platform into normalized ListeningEvents.

Reads all .local/events/*.json (written by the import_* scripts),
matches each raw play's (artist, title, platform, sourceId) against
the canonical songs in src/data/public/songs.json using the matching
hierarchy in scripts/lib/matching.py, and writes:

- .local/normalized/events.json — ListeningEvents with a resolved songId
- .local/normalized/new-songs.json — song stubs for plays that didn't
  match anything already curated (these become new Song entries once
  generate_public_data.py runs, with personal curation left blank for
  a human to fill in)
"""

from collections import Counter
from pathlib import Path
from typing import Optional

from scripts.lib.jsonio import read_json, write_json
from scripts.lib.matching import match_song, slugify
from scripts.lib.paths import EVENTS_DIR, NORMALIZED_DIR, PUBLIC_SONGS_PATH


def run(
    events_dir: Path = EVENTS_DIR,
    songs_path: Path = PUBLIC_SONGS_PATH,
    normalized_dir: Path = NORMALIZED_DIR,
) -> dict:
    canonical: list[dict] = read_json(songs_path, default=[])
    new_songs: dict[str, dict] = {}

    raw_plays: list[dict] = []
    if events_dir.exists():
        for file in sorted(events_dir.glob('*.json')):
            raw_plays.extend(read_json(file, default=[]))

    match_counts: Counter[str] = Counter()
    resolved_events = []

    for raw in raw_plays:
        pool = canonical + list(new_songs.values())
        song_id, tier = match_song(
            raw['artist'], raw['title'], raw['platform'], raw.get('sourceId'), pool
        )
        match_counts[tier] += 1

        if song_id is None:
            song_id = _unique_slug(f"{raw['artist']}-{raw['title']}", new_songs, canonical)
            id_field = 'appleMusicId' if raw['platform'] == 'apple_music' else 'youtubeMusicId'
            new_songs[song_id] = {
                'id': song_id,
                'title': raw['title'],
                'artist': raw['artist'],
                'genres': [],
                id_field: raw.get('sourceId'),
            }

        resolved_events.append(
            {
                'id': raw['id'],
                'timestamp': raw['timestamp'],
                'songId': song_id,
                'platform': raw['platform'],
                'durationPlayed': raw.get('durationPlayed'),
                'sourceId': raw.get('sourceId'),
                'sourceMetadata': raw.get('sourceMetadata'),
            }
        )

    write_json(normalized_dir / 'events.json', resolved_events)
    write_json(normalized_dir / 'new-songs.json', list(new_songs.values()))

    return {
        'events': len(resolved_events),
        'matchTiers': dict(match_counts),
        'newSongs': len(new_songs),
    }


def _unique_slug(basis: str, new_songs: dict, canonical: list[dict]) -> str:
    existing_ids = {s['id'] for s in canonical} | set(new_songs.keys())
    slug: Optional[str] = slugify(basis)
    candidate = slug
    n = 2
    while candidate in existing_ids:
        candidate = f'{slug}-{n}'
        n += 1
    return candidate


def main() -> None:
    summary = run()
    print(
        f'[normalize] events={summary["events"]} new_songs={summary["newSongs"]} '
        f'tiers={summary["matchTiers"]}'
    )


if __name__ == '__main__':
    main()
