"""Song identity matching, per the hierarchy in VISION.md section 25:

1. Platform ID
2. ISRC (not implemented — no source currently supplies one)
3. Exact artist + title
4. Normalized artist + title
5. Fuzzy matching
6. Manual confirmation (not implemented — fuzzy matches are applied
   automatically above FUZZY_THRESHOLD, which is a known V1
   limitation; see scripts/README.md)

Never merges ambiguous songs silently: anything below the fuzzy
threshold is left unmatched and becomes a new song candidate instead
of being force-merged into an existing one.
"""

import re
import unicodedata
from difflib import SequenceMatcher
from typing import Optional

FUZZY_THRESHOLD = 0.85

_NOISE_PATTERN = re.compile(
    r'\s*[\(\[][^)\]]*(official|audio|video|lyrics?|remaster(ed)?|remix|version)[^)\]]*[\)\]]\s*'
    r'|\s*-\s*(remaster(ed)?( \d{4})?|live|radio edit|topic)\s*$',
    re.IGNORECASE,
)


def _clean(value: str) -> str:
    value = _NOISE_PATTERN.sub('', value)
    value = unicodedata.normalize('NFKD', value).encode('ascii', 'ignore').decode('ascii')
    value = re.sub(r'[^a-z0-9]+', ' ', value.lower()).strip()
    return value


def normalize_key(artist: str, title: str) -> str:
    return f'{_clean(artist)}::{_clean(title)}'


def slugify(value: str) -> str:
    slug = _clean(value).replace(' ', '-')
    return re.sub(r'-{2,}', '-', slug).strip('-') or 'untitled'


def match_song(
    artist: str,
    title: str,
    platform: str,
    platform_track_id: Optional[str],
    canonical_songs: list[dict],
) -> tuple[Optional[str], str]:
    id_field = 'appleMusicId' if platform == 'apple_music' else 'youtubeMusicId'

    if platform_track_id:
        for song in canonical_songs:
            if song.get(id_field) and song[id_field] == platform_track_id:
                return song['id'], 'platform_id'

    for song in canonical_songs:
        if song['artist'] == artist and song['title'] == title:
            return song['id'], 'exact'

    key = normalize_key(artist, title)
    for song in canonical_songs:
        if normalize_key(song['artist'], song['title']) == key:
            return song['id'], 'normalized'

    best: Optional[tuple[str, float]] = None
    for song in canonical_songs:
        ratio = SequenceMatcher(None, key, normalize_key(song['artist'], song['title'])).ratio()
        if ratio >= FUZZY_THRESHOLD and (best is None or ratio > best[1]):
            best = (song['id'], ratio)
    if best:
        return best[0], 'fuzzy'

    return None, 'unmatched'
