"""Utilities to dynamically load implementation classes by dotted import path."""

import importlib
from typing import TypeVar

T = TypeVar('T')


def get_impl(base_class: type[T], path: str) -> type[T]:
    """Resolve a dotted import path to a concrete implementation class.

    Args:
        base_class: The expected base class of the implementation (used for
            type checking by callers).
        path: Fully qualified class name, e.g. ``pkg.mod.ClassName``.

    Returns:
        The resolved class referenced by ``path``.
    """
    module_name, _, attr_name = path.rpartition('.')
    if not module_name:
        raise ImportError(f'Invalid implementation path: {path!r}')
    module = importlib.import_module(module_name)
    return getattr(module, attr_name)
