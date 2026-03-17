import os
from pathlib import Path
import logging

logger = logging.getLogger(__name__)

def load_instruction(filename: str) -> str:
    """
    Loads an instruction text file from the instructions directory.
    """
    try:
        # Assuming instructions folder is at the root of the backend directory
        base_dir = Path(__file__).resolve().parent.parent
        instruction_path = base_dir / "instructions" / filename
        
        with open(instruction_path, "r", encoding="utf-8") as f:
            return f.read().strip()
    except FileNotFoundError:
        logger.error(f"Instruction file not found: {filename}")
        raise
    except Exception as e:
        logger.error(f"Error loading instruction {filename}: {str(e)}")
        raise
