"""Data shapes for the local pipeline.

RawPlay is what an importer produces straight from a platform export
(still carrying raw artist/title text). ListeningEvent is the
normalized shape from src/types/listening-event.ts, produced once
normalize.py has resolved a RawPlay to a canonical songId.
"""

from __future__ import annotations

import dataclasses
import hashlib
from datetime import datetime, timezone
from typing import Any, Optional


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def make_event_id(platform: str, source_id: Optional[str], timestamp: str, artist: str, title: str) -> str:
    """Deterministic id so re-importing the same raw record is a no-op."""
    basis = f'{platform}:{source_id or ""}:{timestamp}:{artist}:{title}'
    return hashlib.sha1(basis.encode('utf-8')).hexdigest()[:16]


@dataclasses.dataclass
class RawPlay:
    id: str
    platform: str
    artist: str
    title: str
    timestamp: str
    durationPlayed: Optional[float] = None
    sourceId: Optional[str] = None
    sourceMetadata: Optional[dict[str, Any]] = None

    def to_dict(self) -> dict[str, Any]:
        return {k: v for k, v in dataclasses.asdict(self).items() if v is not None}


@dataclasses.dataclass
class ListeningEvent:
    id: str
    timestamp: str
    songId: str
    platform: str
    durationPlayed: Optional[float] = None
    sourceId: Optional[str] = None
    sourceMetadata: Optional[dict[str, Any]] = None

    def to_dict(self) -> dict[str, Any]:
        return {k: v for k, v in dataclasses.asdict(self).items() if v is not None}


@dataclasses.dataclass
class ImportJob:
    id: str
    platform: str
    source: str
    startedAt: str
    completedAt: Optional[str] = None
    recordsFound: int = 0
    recordsImported: int = 0
    recordsSkipped: int = 0
    errors: list[str] = dataclasses.field(default_factory=list)

    def to_dict(self) -> dict[str, Any]:
        return dataclasses.asdict(self)
