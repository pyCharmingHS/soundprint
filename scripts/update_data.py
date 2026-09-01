"""Run the full local data pipeline end to end.

raw exports (.local/apple, .local/youtube)
    -> import_apple, import_youtube   (.local/events/)
    -> normalize                      (.local/normalized/)
    -> analyze                        (.local/analysis/)
    -> generate_public_data           (src/data/public/songs.json)

Safe to re-run: every stage is idempotent.
"""

from scripts import analyze, generate_public_data, import_apple, import_youtube, normalize


def main() -> None:
    apple_job = import_apple.run()
    print(
        f'[apple_music] found={apple_job.recordsFound} imported={apple_job.recordsImported} '
        f'skipped={apple_job.recordsSkipped} errors={len(apple_job.errors)}'
    )

    youtube_job = import_youtube.run()
    print(
        f'[youtube_music] found={youtube_job.recordsFound} imported={youtube_job.recordsImported} '
        f'skipped={youtube_job.recordsSkipped} errors={len(youtube_job.errors)}'
    )

    normalize_summary = normalize.run()
    print(
        f'[normalize] events={normalize_summary["events"]} '
        f'new_songs={normalize_summary["newSongs"]} tiers={normalize_summary["matchTiers"]}'
    )

    analyze_summary = analyze.run()
    print(f'[analyze] songs={analyze_summary["songs"]}')

    generate_summary = generate_public_data.run()
    print(
        f'[generate_public_data] total={generate_summary["total"]} '
        f'updated={generate_summary["updated"]} added={generate_summary["added"]}'
    )


if __name__ == '__main__':
    main()
