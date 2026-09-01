"""Merge computed listening stats into the public songs.json.

Reads the existing curated src/data/public/songs.json plus the
output of analyze.py and normalize.py, and writes an updated
songs.json where:

- existing songs get their `listening` block replaced with freshly
  computed stats — `personal` curation and objective metadata
  (title, artist, categories, tags, why, ...) are left untouched
- plays that didn't match any existing song become new Song entries,
  with blank personal curation for a human to fill in later

This is the only stage allowed to write to src/data/public/ — every
earlier stage only touches .local/.
"""

from pathlib import Path

from scripts.lib.jsonio import read_json, write_json
from scripts.lib.paths import ANALYSIS_DIR, NORMALIZED_DIR, PUBLIC_SONGS_PATH

EMPTY_LISTENING = {'plays': 0, 'minutes': 0}
EMPTY_PERSONAL = {'isPantheon': False, 'categories': [], 'tags': []}


def run(
    songs_path: Path = PUBLIC_SONGS_PATH,
    analysis_dir: Path = ANALYSIS_DIR,
    normalized_dir: Path = NORMALIZED_DIR,
    output_path: Path = None,
) -> dict:
    if output_path is None:
        output_path = songs_path

    canonical: list[dict] = read_json(songs_path, default=[])
    stats: dict[str, dict] = read_json(analysis_dir / 'listening-stats.json', default={})
    new_songs: list[dict] = read_json(normalized_dir / 'new-songs.json', default=[])

    by_id = {song['id']: song for song in canonical}
    original_ids = set(by_id.keys())

    added = 0
    for stub in new_songs:
        if stub['id'] not in by_id:
            by_id[stub['id']] = {
                **stub,
                'listening': dict(EMPTY_LISTENING),
                'personal': dict(EMPTY_PERSONAL),
            }
            added += 1

    updated = 0
    for song_id, listening in stats.items():
        if song_id in by_id:
            by_id[song_id]['listening'] = listening
            if song_id in original_ids:
                updated += 1

    # Skip the write on a no-op run — reformatting the file on every pass
    # (even with identical content) would be pure git-diff noise.
    if added or updated:
        write_json(output_path, list(by_id.values()))

    return {'total': len(by_id), 'updated': updated, 'added': added}


def main() -> None:
    summary = run()
    print(
        f'[generate_public_data] total={summary["total"]} '
        f'updated={summary["updated"]} added={summary["added"]}'
    )


if __name__ == '__main__':
    main()
