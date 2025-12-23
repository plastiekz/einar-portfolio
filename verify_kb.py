from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto("http://localhost:3000")

        # Navigate to Knowledge Base
        page.get_by_text("Synapse Memory").click()

        # Wait for content
        page.wait_for_selector("text=Neural Archive")

        # Select a paper to ensure right panel is active
        page.get_by_text("Attention Is All You Need").click()

        # Check tabs
        page.get_by_text("Audio Overview").click()

        # Take screenshot
        page.screenshot(path="verification/tab_audio.png")
        browser.close()

if __name__ == "__main__":
    run()