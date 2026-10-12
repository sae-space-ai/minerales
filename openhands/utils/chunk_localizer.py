"""Lightweight text chunking + fuzzy matching helper.

Used by the LLM-based file editing flow to locate the most relevant chunks of
a large file for a given search query.
"""

import difflib
from dataclasses import dataclass


@dataclass
class Chunk:
    """A contiguous slice of lines from a text document."""

    start_line: int  # 0-based index of the first line in the chunk
    end_line: int  # 0-based index of the last line (exclusive)
    content: str


def split_into_chunks(lines: list[str], chunk_size: int = 50, overlap: int = 10) -> list[Chunk]:
    """Split a list of lines into overlapping chunks."""
    if chunk_size <= 0:
        raise ValueError('chunk_size must be positive')
    overlap = max(0, min(overlap, chunk_size - 1))
    chunks: list[Chunk] = []
    step = chunk_size - overlap
    i = 0
    while i < len(lines):
        segment = lines[i : i + chunk_size]
        chunks.append(
            Chunk(start_line=i, end_line=i + len(segment), content=''.join(segment))
        )
        if i + chunk_size >= len(lines):
            break
        i += step
    return chunks


def get_top_k_chunk_matches(
    text: str | list[str], query: str, k: int = 3, chunk_size: int = 50, overlap: int = 10
) -> list[Chunk]:
    """Return the ``k`` chunks of ``text`` that best match ``query``.

    Matching is done with a cheap ratio-based similarity so it stays fast and
    dependency-free; callers only need approximate localization.
    """
    lines = text.splitlines(keepends=True) if isinstance(text, str) else list(text)
    chunks = split_into_chunks(lines, chunk_size=chunk_size, overlap=overlap)
    query_norm = query.strip().lower()

    def score(chunk: Chunk) -> float:
        candidate = chunk.content.lower()
        if query_norm and query_norm in candidate:
            return 1.0
        return difflib.SequenceMatcher(None, query_norm, candidate).ratio()

    ranked = sorted(chunks, key=score, reverse=True)
    return ranked[: max(0, k)]
