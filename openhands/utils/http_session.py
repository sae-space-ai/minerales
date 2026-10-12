"""Thin wrapper around ``httpx.Client`` with base-URL support."""

from typing import Any

import httpx


class HttpSession(httpx.Client):
    """An ``httpx.Client`` bound to a base URL.

    All request paths are resolved relative to ``base_url``.
    """

    def __init__(self, base_url: str = '', **kwargs: Any) -> None:
        if base_url and not base_url.endswith('/'):
            base_url += '/'
        super().__init__(base_url=base_url, **kwargs)
