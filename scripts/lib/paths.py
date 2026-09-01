"""Central path constants for the local data pipeline.

All raw/intermediate pipeline state lives under .local/, which is
gitignored and never committed. Only src/data/public/*.json (the
curated output) is meant to be public.
"""

from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent.parent

LOCAL_DIR = REPO_ROOT / '.local'
RAW_APPLE_DIR = LOCAL_DIR / 'apple'
RAW_YOUTUBE_DIR = LOCAL_DIR / 'youtube'
EVENTS_DIR = LOCAL_DIR / 'events'
IMPORTS_DIR = LOCAL_DIR / 'imports'
NORMALIZED_DIR = LOCAL_DIR / 'normalized'
ANALYSIS_DIR = LOCAL_DIR / 'analysis'

PUBLIC_DATA_DIR = REPO_ROOT / 'src' / 'data' / 'public'
PUBLIC_SONGS_PATH = PUBLIC_DATA_DIR / 'songs.json'
PUBLIC_CATEGORIES_PATH = PUBLIC_DATA_DIR / 'categories.json'
