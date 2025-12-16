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

    print(f"Status: {status}")
    print("\n".join(report))

if __name__ == "__main__":
    interval = int(os.environ.get("CHECK_INTERVAL", 3600))
    print(f"Starting Antigravity Check Monitor (Interval: {interval} seconds)")

    while True:
        print(f"\n--- Check at {datetime.now().strftime('%Y-%m-%d %H:%M:%S')} ---")
        check_readiness()
        time.sleep(interval)
