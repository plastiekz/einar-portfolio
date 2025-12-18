"""
Antigravity Check: A monitoring script to verify the environment state.
"""
import time
import os
import sys
import argparse
from datetime import datetime

def check_environment():
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    print(f"[{timestamp}] Checking gravity...")

    # 1. Check for Google GenAI Library
    try:
        import google.genai
        print("  ✅ google-genai library installed.")
    except ImportError:
        print("  ❌ google-genai library NOT installed. Run 'pip install google-genai'.")

    # 2. Check for API Key
    api_key = os.environ.get("GOOGLE_API_KEY")
    if api_key and api_key.startswith("AIza"):
        print("  ✅ GOOGLE_API_KEY found and looks valid (starts with AIza).")
    else:
        print("  ❌ GOOGLE_API_KEY missing or invalid.")

    # 3. Check for Gemini Service File
    if os.path.exists("services/geminiService.ts"):
         print("  ✅ services/geminiService.ts exists.")
    else:
         print("  ❌ services/geminiService.ts missing.")

    print(f"[{timestamp}] Gravity check complete.")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Antigravity Environment Monitor")
    parser.add_argument("--once", action="store_true", help="Run the check once and exit")
    args = parser.parse_args()

    print("Starting Antigravity Monitor...")

    if args.once:
        check_environment()
    else:
        while True:
            check_environment()
            time.sleep(60)
