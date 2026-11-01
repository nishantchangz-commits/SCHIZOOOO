"""
Local Runner Script.

Concurrently launches:
1. FastAPI Backend server on http://127.0.0.1:8000
2. Streamlit Chat Frontend on http://127.0.0.1:8501
"""

import os
import sys
import time
import subprocess
import signal
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent
SITE_PACKAGES = ROOT_DIR / "site-packages"

# Build environment variables
env = os.environ.copy()
python_path_entries = [str(ROOT_DIR)]
if SITE_PACKAGES.exists():
    python_path_entries.append(str(SITE_PACKAGES))

existing_pp = env.get("PYTHONPATH", "")
if existing_pp:
    python_path_entries.append(existing_pp)

env["PYTHONPATH"] = os.pathsep.join(python_path_entries)
env["API_URL"] = "http://127.0.0.1:8000"

def start_services():
    print("=" * 70)
    print("🧠 Starting NeuroRetrieval Mental Health & EEG Application")
    print("=" * 70)
    print(f"• Root Directory:   {ROOT_DIR}")
    print(f"• Backend URL:      http://127.0.0.1:8000")
    print(f"• API Docs (Docs):  http://127.0.0.1:8000/docs")
    print(f"• Streamlit UI:     http://127.0.0.1:8501")
    print("=" * 70)

    # 1. Start FastAPI Backend via Uvicorn
    backend_cmd = [
        sys.executable,
        "-m", "uvicorn",
        "backend.main:app",
        "--host", "127.0.0.1",
        "--port", "8000"
    ]
    print("[Launcher] Launching FastAPI backend...")
    backend_proc = subprocess.Popen(
        backend_cmd,
        cwd=str(ROOT_DIR),
        env=env
    )

    # Allow backend to initialize
    time.sleep(2)

    # 2. Start Streamlit Frontend
    frontend_cmd = [
        sys.executable,
        "-m", "streamlit",
        "run",
        "frontend/app.py",
        "--server.port", "8501",
        "--server.address", "127.0.0.1",
        "--server.headless", "true",
        "--browser.gatherUsageStats", "false"
    ]
    print("[Launcher] Launching Streamlit frontend...")
    frontend_proc = subprocess.Popen(
        frontend_cmd,
        cwd=str(ROOT_DIR),
        env=env
    )

    print("\n✅ Both services are now running concurrently.")
    print("Press Ctrl+C to terminate both servers.\n")

    try:
        while True:
            # Check if any process terminated unexpectedly
            b_ret = backend_proc.poll()
            f_ret = frontend_proc.poll()
            if b_ret is not None:
                print(f"[Launcher] Backend exited with code {b_ret}.")
                break
            if f_ret is not None:
                print(f"[Launcher] Frontend exited with code {f_ret}.")
                break
            time.sleep(1)
    except KeyboardInterrupt:
        print("\n[Launcher] Shutting down services...")
    finally:
        for proc, name in [(backend_proc, "Backend"), (frontend_proc, "Frontend")]:
            if proc.poll() is None:
                print(f"[Launcher] Terminating {name}...")
                proc.terminate()
                try:
                    proc.wait(timeout=4)
                except subprocess.TimeoutExpired:
                    proc.kill()
        print("[Launcher] Shutdown complete.")

if __name__ == "__main__":
    start_services()
