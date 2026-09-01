import unittest

from scripts.lib.matching import match_song, slugify

CANONICAL = [
    {
        'id': 'song-a',
        'title': 'Estática',
        'artist': 'Cables Sueltos',
        'appleMusicId': 'apple-estatica-123',
    },
    {
        'id': 'song-b',
        'title': 'Vuelve a Mí',
        'artist': 'Hermanos Ferreira',
    },
]


class MatchSongTest(unittest.TestCase):
    def test_platform_id_takes_priority(self):
        song_id, tier = match_song(
            'Some Other Artist Name',
            'A Totally Different Title',
            'apple_music',
            'apple-estatica-123',
            CANONICAL,
        )
        self.assertEqual(song_id, 'song-a')
        self.assertEqual(tier, 'platform_id')

    def test_exact_match(self):
        song_id, tier = match_song('Cables Sueltos', 'Estática', 'apple_music', None, CANONICAL)
        self.assertEqual(song_id, 'song-a')
        self.assertEqual(tier, 'exact')

    def test_normalized_match_strips_noise_suffix(self):
        song_id, tier = match_song(
            'Hermanos Ferreira', 'Vuelve a Mí (Official Audio)', 'youtube_music', None, CANONICAL
        )
        self.assertEqual(song_id, 'song-b')
        self.assertEqual(tier, 'normalized')

    def test_fuzzy_match_for_minor_typo(self):
        song_id, tier = match_song(
            'Hermanos Ferreira', 'Vuelve a Miz', 'youtube_music', None, CANONICAL
        )
        self.assertEqual(song_id, 'song-b')
        self.assertEqual(tier, 'fuzzy')

    def test_unmatched_for_unrelated_song(self):
        song_id, tier = match_song(
            'Completely Unrelated Artist', 'Totally Different Song', 'youtube_music', None, CANONICAL
        )
        self.assertIsNone(song_id)
        self.assertEqual(tier, 'unmatched')


class SlugifyTest(unittest.TestCase):
    def test_slugify_basic(self):
        self.assertEqual(
            slugify('Nueva Banda de Prueba-Horizonte Roto'),
            'nueva-banda-de-prueba-horizonte-roto',
        )


if __name__ == '__main__':
    unittest.main()
