"""Aggregate normalized ListeningEvents into per-song listening stats.

Reads .local/normalized/events.json and writes
.local/analysis/listening-stats.json: one SongListening-shaped record
per songId (plays, minutes, first/last heard, plays by hour/day/
month/year). This only computes the raw aggregates that feed
Song.listening — the derived discovery metrics (replay intensity,
current obsession, Pantheon candidates, etc.) already live in
src/lib/analytics.ts and are deliberately not duplicated here.
"""

from collections import Counter, defaultdict
from datetime import datetime, timezone
from pathlib import Path

from scripts.lib.jsonio import read_json, write_json
from scripts.lib.paths import ANALYSIS_DIR, NORMALIZED_DIR


def _parse_timestamp(value: str) -> datetime:
    """Parses ISO timestamps from any platform into a common, comparable
    form. Sources disagree on whether timestamps carry timezone info
    (e.g. a Google Takeout-style "Z" suffix vs. a naive local timestamp),
    so naive values are assumed UTC rather than left unorderable against
    aware ones."""
    dt = datetime.fromisoformat(value.replace('Z', '+00:00'))
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt


def run(normalized_dir: Path = NORMALIZED_DIR, analysis_dir: Path = ANALYSIS_DIR) -> dict:
    events = read_json(normalized_dir / 'events.json', default=[])

    by_song: dict[str, list[dict]] = defaultdict(list)
    for event in events:
        by_song[event['songId']].append(event)

    stats: dict[str, dict] = {}
    for song_id, song_events in by_song.items():
        timestamps = sorted(_parse_timestamp(e['timestamp']) for e in song_events)
        minutes = sum((e.get('durationPlayed') or 0) for e in song_events) / 60

        by_hour: Counter[str] = Counter()
        by_day: Counter[str] = Counter()
        by_month: Counter[str] = Counter()
        by_year: Counter[str] = Counter()
        for dt in timestamps:
            by_hour[str(dt.hour)] += 1
            by_day[dt.strftime('%A')] += 1
            by_month[str(dt.month)] += 1
            by_year[str(dt.year)] += 1

        stats[song_id] = {
            'plays': len(song_events),
            'minutes': round(minutes, 1),
            'firstListened': timestamps[0].isoformat(),
            'lastListened': timestamps[-1].isoformat(),
            'playsByHour': dict(by_hour),
            'playsByDay': dict(by_day),
            'playsByMonth': dict(by_month),
            'playsByYear': dict(by_year),
        }

    write_json(analysis_dir / 'listening-stats.json', stats)
    return {'songs': len(stats)}


def main() -> None:
    summary = run()
    print(f'[analyze] songs={summary["songs"]}')


if __name__ == '__main__':
    main()
