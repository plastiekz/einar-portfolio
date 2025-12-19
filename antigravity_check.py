import os
import sys
import time
import importlib.util
from datetime import datetime

def check_readiness():
    report = []
    status = "READY"

    # 1. Check Library Dependency
    if importlib.util.find_spec("google.genai"):
        report.append("[PASS] Library 'google-genai' is installed.")
    else:
        report.append("[FAIL] Library 'google-genai' is MISSING.")
        status = "NOT_READY"

    # 2. Check API Key Constraint
    google_key = os.environ.get("GOOGLE_API_KEY")
    gemini_key = os.environ.get("GEMINI_API_KEY")

    if google_key:
         # Check simple validity structure without revealing key
        if google_key.startswith("AIza"):
            report.append("[PASS] GOOGLE_API_KEY is present and looks valid (starts with AIza).")
        else:
            report.append("[WARN] GOOGLE_API_KEY is present but format is unexpected.")
    elif gemini_key:
         # Check simple validity structure without revealing key
        if gemini_key.startswith("AIza"):
            report.append("[PASS] GEMINI_API_KEY is present and looks valid (starts with AIza).")
        else:
            report.append("[WARN] GEMINI_API_KEY is present but format is unexpected.")
    else:
        report.append("[FAIL] GOOGLE_API_KEY (and GEMINI_API_KEY) is MISSING in environment.")
        status = "NOT_READY"

    # 3. Check for Push Results Code (Simulated by checking geminiService.ts existence and content)
    # The user asked to look for an error in the code used to push results.
    ts_file = "services/geminiService.ts"
    if os.path.exists(ts_file):
         if os.path.getsize(ts_file) > 0:
             report.append(f"[PASS] '{ts_file}' (Push Results Code) found and is not empty.")
         else:
             report.append(f"[WARN] '{ts_file}' found but is EMPTY.")
    else:
         report.append(f"[WARN] '{ts_file}' NOT found. Pushing results might fail.")


    print(f"Status: {status}")
    print("\n".join(report))

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="Run Antigravity Check")
    parser.add_argument("--once", action="store_true", help="Run check once and exit")
    args = parser.parse_args()

    interval = int(os.environ.get("CHECK_INTERVAL", 3600))

    if args.once:
        print(f"Running Antigravity Check (Once)")
        check_readiness()
    else:
        print(f"Starting Antigravity Check Monitor (Interval: {interval} seconds)")
        while True:
            print(f"\n--- Check at {datetime.now().strftime('%Y-%m-%d %H:%M:%S')} ---")
            check_readiness()
            time.sleep(interval)
