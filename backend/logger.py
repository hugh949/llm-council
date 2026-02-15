"""Centralized logging for LLM Council. Logs to stderr for Azure App Service visibility."""

import logging
import sys

# Single logger for the app - use get_logger(__name__) in modules for namespacing
_logger = None


def get_logger(name: str) -> logging.Logger:
    """Get a logger. All loggers share the same handler (stderr)."""
    global _logger
    log = logging.getLogger(f"llm_council.{name}")
    if not log.handlers:
        log.setLevel(logging.INFO)
        h = logging.StreamHandler(sys.stderr)
        h.setFormatter(logging.Formatter("%(asctime)s [%(name)s] %(levelname)s %(message)s"))
        log.addHandler(h)
    return log


def log_api(operation: str, **kwargs):
    """Log an API operation with key context for troubleshooting."""
    parts = [f"API {operation}"]
    for k, v in kwargs.items():
        if v is not None:
            parts.append(f"{k}={v}")
    get_logger("api").info(" | ".join(parts))
