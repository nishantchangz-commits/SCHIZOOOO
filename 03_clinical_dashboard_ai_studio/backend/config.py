import os
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables from .env file if present
load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = Path(os.getenv("DATA_DIR", BASE_DIR / "data"))
CHROMA_PERSIST_DIR = Path(os.getenv("CHROMA_PERSIST_DIR", BASE_DIR / "backend" / "chroma_db"))

# LLM Configuration
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
LLM_MODEL = os.getenv("LLM_MODEL", "gemini-2.0-flash")

# Server Configuration
BACKEND_HOST = os.getenv("BACKEND_HOST", "127.0.0.1")
BACKEND_PORT = int(os.getenv("BACKEND_PORT", "8000"))
FRONTEND_PORT = int(os.getenv("FRONTEND_PORT", "8501"))
API_URL = os.getenv("API_URL", f"http://{BACKEND_HOST}:{BACKEND_PORT}")

# Application Disclaimers
STANDARD_DISCLAIMER = (
    "DISCLAIMER: This application is an educational and informational support tool powered by AI. "
    "It is NOT a medical device, diagnostic tool, or a replacement for clinical psychiatric assessment, "
    "psychotherapy, or medical treatment. If you or someone you know is in crisis or distress, "
    "please contact emergency services or a dedicated crisis helpline immediately."
)
