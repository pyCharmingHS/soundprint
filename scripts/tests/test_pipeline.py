"""End-to-end test of the pipeline against fixture data.

Runs entirely inside a temp directory — never touches the real
.local/ or src/data/public/songs.json. Proves: idempotent imports,
cross-platform matching (same song discovered via two platforms
resolves to one songId), and that generate_public_data merges
listening stats without disturbing existing personal curation.
"""

import json
import shutil
import tempfile
import unittest
from pathlib import Path

from scripts import analyze, generate_public_data, import_apple, import_youtube, normalize

FIXTURES_DIR = Path(__file__).resolve().parent / 'fixtures'


class PipelineTest(unittest.TestCase):
    def setUp(self):
        self.tmp = Path(tempfile.mkdtemp())
        self.raw_apple = self.tmp / 'apple'
        self.raw_youtube = self.tmp / 'youtube'
        self.events_dir = self.tmp / 'events'
        self.imports_dir = self.tmp / 'imports'
        self.normalized_dir = self.tmp / 'normalized'
        self.analysis_dir = self.tmp / 'analysis'
        self.raw_apple.mkdir(parents=True)
        self.raw_youtube.mkdir(parents=True)

        shutil.copy(FIXTURES_DIR / 'apple_sample.json', self.raw_apple / 'sample.json')
        shutil.copy(FIXTURES_DIR / 'youtube_sample.json', self.raw_youtube / 'sample.json')

        self.songs_path = self.tmp / 'songs.json'
        self.songs_path.write_text(
            json.dumps(
                [
                    {
                        'id': 'song-vidrio-y-sal',
                        'title': 'Vidrio y Sal',
                        'artist': 'Renata Cruz',
                        'genres': ['bachata'],
                        'listening': {'plays': 17, 'minutes': 66.3},
                        'personal': {
                            'isPantheon': True,
                            'pantheonRank': 1,
                            'categories': ['personal', 'hurts'],
                            'tags': ['melancholic'],
                            'why': 'Barely 17 plays, but every one wrecked me a little.',
                        },
                    }
                ]
            ),
            encoding='utf-8',
        )

    def tearDown(self):
        shutil.rmtree(self.tmp, ignore_errors=True)

    def apple_events_path(self) -> Path:
        return self.events_dir / 'apple_music.json'

    def youtube_events_path(self) -> Path:
        return self.events_dir / 'youtube_music.json'

    def test_apple_import_is_idempotent(self):
        first = import_apple.run(self.raw_apple, self.apple_events_path(), self.imports_dir)
        self.assertEqual(first.recordsFound, 3)
        self.assertEqual(first.recordsImported, 3)
        self.assertEqual(first.recordsSkipped, 0)

        second = import_apple.run(self.raw_apple, self.apple_events_path(), self.imports_dir)
        self.assertEqual(second.recordsFound, 3)
        self.assertEqual(second.recordsImported, 0)
        self.assertEqual(second.recordsSkipped, 3)

    def test_youtube_import_is_idempotent(self):
        first = import_youtube.run(self.raw_youtube, self.youtube_events_path(), self.imports_dir)
        self.assertEqual(first.recordsImported, 1)

        second = import_youtube.run(self.raw_youtube, self.youtube_events_path(), self.imports_dir)
        self.assertEqual(second.recordsImported, 0)
        self.assertEqual(second.recordsSkipped, 1)

    def test_full_pipeline_merges_without_clobbering_curation(self):
        import_apple.run(self.raw_apple, self.apple_events_path(), self.imports_dir)
        import_youtube.run(self.raw_youtube, self.youtube_events_path(), self.imports_dir)

        summary = normalize.run(self.events_dir, self.songs_path, self.normalized_dir)
        self.assertEqual(summary['events'], 4)  # 3 apple + 1 youtube
        self.assertEqual(summary['newSongs'], 1)  # "Horizonte Roto", one song, two platforms
        self.assertEqual(summary['matchTiers'].get('exact'), 3)  # 2 Vidrio y Sal + 1 cross-platform
        self.assertEqual(summary['matchTiers'].get('unmatched'), 1)

        analyze.run(self.normalized_dir, self.analysis_dir)

        output_path = self.tmp / 'songs.out.json'
        gen_summary = generate_public_data.run(
            self.songs_path, self.analysis_dir, self.normalized_dir, output_path
        )
        self.assertEqual(gen_summary['updated'], 1)
        self.assertEqual(gen_summary['added'], 1)

        result = {s['id']: s for s in json.loads(output_path.read_text(encoding='utf-8'))}

        vidrio = result['song-vidrio-y-sal']
        self.assertEqual(vidrio['listening']['plays'], 2)
        self.assertEqual(vidrio['personal']['isPantheon'], True)
        self.assertEqual(
            vidrio['personal']['why'], 'Barely 17 plays, but every one wrecked me a little.'
        )
        self.assertEqual(vidrio['personal']['categories'], ['personal', 'hurts'])

        new_song = next(s for s in result.values() if s['title'] == 'Horizonte Roto')
        self.assertEqual(new_song['listening']['plays'], 2)
        self.assertEqual(new_song['personal']['isPantheon'], False)

    def test_rerunning_full_pipeline_is_stable(self):
        def run_all():
            import_apple.run(self.raw_apple, self.apple_events_path(), self.imports_dir)
            import_youtube.run(self.raw_youtube, self.youtube_events_path(), self.imports_dir)
            normalize.run(self.events_dir, self.songs_path, self.normalized_dir)
            analyze.run(self.normalized_dir, self.analysis_dir)
            output_path = self.tmp / 'songs.out.json'
            generate_public_data.run(
                self.songs_path, self.analysis_dir, self.normalized_dir, output_path
            )
            return json.loads(output_path.read_text(encoding='utf-8'))

        first_result = run_all()
        second_result = run_all()
        self.assertEqual(first_result, second_result)


if __name__ == '__main__':
    unittest.main()
