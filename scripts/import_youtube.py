"""Import raw YouTube Music export files into normalized RawPlay records.

Reads every *.json file in .local/youtube/ and writes deduped raw
plays to .local/events/youtube_music.json, plus an ImportJob summary
to .local/imports/.

PLACEHOLDER FORMAT: whether Google Takeout's YouTube Music history
export (or another source) ends up being the real input hasn't been
investigated yet (Phase 7 — see VISION.md section 24). Until then,
each input file is expected to be a JSON array like:

    [
      {
        "title": "Song Title",
        "channelTitle": "Artist Name - Topic",
        "time": "2026-08-01T20:14:00.000Z",
        "videoId": "yt-optional-id"
      }
    ]

"<Artist> - Topic" is how YouTube auto-generates channel names for
official audio uploads, so that suffix is stripped when present.
Re-running against the same files is a no-op: event ids are derived
deterministically from (platform, videoId, time, artist, title).
"""

from pathlib import Path

from scripts.lib.jsonio import read_json, write_json
from scripts.lib.models import ImportJob, RawPlay, make_event_id, now_iso
from scripts.lib.paths import EVENTS_DIR, IMPORTS_DIR, RAW_YOUTUBE_DIR

PLATFORM = 'youtube_music'


def _clean_channel_name(channel_title: str) -> str:
    if channel_title.endswith(' - Topic'):
        return channel_title[: -len(' - Topic')]
    return channel_title


def parse_file(path: Path) -> list[RawPlay]:
    records = read_json(path, default=[])
    plays = []
    for record in records:
        artist = _clean_channel_name((record.get('channelTitle') or '').strip())
        title = (record.get('title') or '').strip()
        timestamp = record.get('time')
        if not (artist and title and timestamp):
            continue

        video_id = record.get('videoId')

        plays.append(
            RawPlay(
                id=make_event_id(PLATFORM, video_id, timestamp, artist, title),
                platform=PLATFORM,
                artist=artist,
                title=title,
                timestamp=timestamp,
                sourceId=video_id,
            )
        )
    return plays


def run(raw_dir: Path = RAW_YOUTUBE_DIR, events_path: Path = None, imports_dir: Path = IMPORTS_DIR) -> ImportJob:
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
