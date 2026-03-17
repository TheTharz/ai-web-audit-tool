import logging
import sys
from pathlib import Path

LOG_FORMAT = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
# Path to the main directory's app.log
LOG_FILE = Path(__file__).resolve().parent.parent / "app.log"


def configure_logging() -> None:
    logging.basicConfig(
        level=logging.INFO,
        format=LOG_FORMAT,
        handlers=[
            logging.FileHandler(LOG_FILE),
            logging.StreamHandler(sys.stdout),
        ],
        # Uvicorn can register handlers before app code runs.
        # force=True ensures our app logging config is always applied.
        force=True,
    )

    # Prevent reloader file-watch logs from creating a write loop in app.log.
    logging.getLogger("watchfiles").setLevel(logging.WARNING)
    logging.getLogger("watchfiles.main").setLevel(logging.WARNING)


logger = logging.getLogger("audit-tool")
