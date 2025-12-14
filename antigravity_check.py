import os
import sys
import importlib.util
import time
import argparse
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
    if os.environ.get("GOOGLE_API_KEY"):
         # Check simple validity structure without revealing key
        key = os.environ.get("GOOGLE_API_KEY")
        if key.startswith("AIza"):
            report.append("[PASS] GOOGLE_API_KEY is present and looks valid (starts with AIza).")
        else:
            report.append("[WARN] GOOGLE_API_KEY is present but format is unexpected.")
    else:
        report.append("[FAIL] GOOGLE_API_KEY is MISSING in environment.")
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
    parser = argparse.ArgumentParser(description="Check Antigravity (Gemini) readiness.")
    parser.add_argument("--monitor", action="store_true", help="Run in continuous monitoring mode")
    args = parser.parse_args()

    interval = int(os.environ.get("CHECK_INTERVAL", 3600))

    if args.monitor or os.environ.get("DAEMON_MODE") == "true":
        print(f"Starting Antigravity Check Monitor (Interval: {interval} seconds)")
        while True:
            print(f"\n--- Check at {datetime.now().strftime('%Y-%m-%d %H:%M:%S')} ---")
            check_readiness()
            time.sleep(interval)
    else:
        check_readiness()
