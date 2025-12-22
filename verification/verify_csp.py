import sys
from playwright.sync_api import sync_playwright

def verify_csp():
    print("Starting CSP verification...")
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Navigate to the preview server (which we will start in background)
        # Note: We will use a port determined by the start command, typically 4173 for vite preview
        # or 3000 as configured in vite.config.ts. vite.config.ts says port 3000 for server,
        # but preview usually defaults to 4173 unless specified.
        # However, package.json script "start" is "vite preview".
        # Let us try 3000 first as per config, if fails, we check output.

        try:
            page.goto("http://localhost:4173", timeout=10000)
        except Exception as e:
            print(f"Failed to load page: {e}")
            sys.exit(1)

        # Check for CSP meta tag
        csp_meta = page.locator("meta[http-equiv=\"Content-Security-Policy\"]")
        if csp_meta.count() > 0:
            content = csp_meta.get_attribute("content")
            print(f"Found CSP: {content}")

            # Verify Tailwind is loading (visually, via screenshot)
            # and that no console errors related to CSP are present (we can hook console)

            page.screenshot(path="verification/csp_verified.png", full_page=True)
            print("Screenshot saved to verification/csp_verified.png")
        else:
            print("CSP Meta tag NOT found!")
            sys.exit(1)

        browser.close()

if __name__ == "__main__":
    verify_csp()
