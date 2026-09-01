"""Import raw Apple Music export files into normalized RawPlay records.

Reads every *.json file in .local/apple/ and writes deduped raw plays
to .local/events/apple_music.json, plus an ImportJob summary to
.local/imports/.

PLACEHOLDER FORMAT: Apple's actual personal-data export/API shape
hasn't been investigated yet (that's Phase 7 — see VISION.md section
23). Until then, each input file is expected to be a JSON array like:

    [
      {
        "trackName": "Song Title",
        "artistName": "Artist Name",
        "albumName": "Album Name",
        "playDate": "2026-08-01T20:14:00",
        "playDurationMs": 201000,
        "trackId": "apple-optional-id"
      }
    ]

Re-running against the same files is a no-op: event ids are derived
deterministically from (platform, trackId, playDate, artist, title).
"""

from pathlib import Path

from scripts.lib.jsonio import read_json, write_json
from scripts.lib.models import ImportJob, RawPlay, make_event_id, now_iso
from scripts.lib.paths import EVENTS_DIR, IMPORTS_DIR, RAW_APPLE_DIR

PLATFORM = 'apple_music'


def parse_file(path: Path) -> list[RawPlay]:
    records = read_json(path, default=[])
    plays = []
    for record in records:
        artist = (record.get('artistName') or '').strip()
        title = (record.get('trackName') or '').strip()
        timestamp = record.get('playDate')
        if not (artist and title and timestamp):
            continue

        duration_ms = record.get('playDurationMs')
        duration_played = duration_ms / 1000 if duration_ms is not None else None
        track_id = record.get('trackId')
        album_name = record.get('albumName')

        plays.append(
            RawPlay(
                id=make_event_id(PLATFORM, track_id, timestamp, artist, title),
                platform=PLATFORM,
                artist=artist,
                title=title,
                timestamp=timestamp,
                durationPlayed=duration_played,
                sourceId=track_id,
                sourceMetadata={'albumName': album_name} if album_name else None,
            )
        )
    return plays


def run(raw_dir: Path = RAW_APPLE_DIR, events_path: Path = None, imports_dir: Path = IMPORTS_DIR) -> ImportJob:
    if events_path is None:
        events_path = EVENTS_DIR / f'{PLATFORM}.json'

    existing = read_json(events_path, default=[])
    existing_ids = {e['id'] for e in existing}

    started_at = now_iso()
    job = ImportJob(id=started_at, platform=PLATFORM, source=str(raw_dir), startedAt=started_at)

    new_plays: list[RawPlay] = []
    files = sorted(raw_dir.glob('*.json')) if raw_dir.exists() else []
    for file in files:
        try:
            plays = parse_file(file)
        except Exception as exc:  # noqa: BLE001 — surfaced via job.errors, not raised
            job.errors.append(f'{file.name}: {exc}')
            continue
        job.recordsFound += len(plays)
        for play in plays:
            if play.id in existing_ids:
                continue
            existing_ids.add(play.id)
            new_plays.append(play)

    job.recordsImported = len(new_plays)
    job.recordsSkipped = job.recordsFound - job.recordsImported
    job.completedAt = now_iso()

    write_json(events_path, existing + [p.to_dict() for p in new_plays])
    write_json(imports_dir / f'{PLATFORM}-{job.id.replace(":", "")}.json', job.to_dict())

    return job


def main() -> None:
    job = run()
    print(
        f'[{PLATFORM}] found={job.recordsFound} imported={job.recordsImported} '
        f'skipped={job.recordsSkipped} errors={len(job.errors)}'
    )


if __name__ == '__main__':
    main()
