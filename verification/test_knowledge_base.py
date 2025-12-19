from playwright.sync_api import sync_playwright, expect

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    # Increase viewport size to avoid overlap
    page = browser.new_page(viewport={'width': 1920, 'height': 1080})
    try:
        page.goto("http://localhost:10000")

        # Try to click using role "button" and name
        print("Clicking Synapse Memory...")
        page.get_by_role("button", name="Synapse Memory").click()

        # Wait for the Knowledge Base view to load
        print("Waiting for Neural Archive...")
        expect(page.get_by_role("heading", name="Neural Archive")).to_be_visible()

        # Check for the tabs
        expect(page.get_by_text("Source Guide")).to_be_visible()
        expect(page.get_by_text("Chat")).to_be_visible()
        expect(page.get_by_text("Audio Overview")).to_be_visible()

        # Select a paper to enable features
        print("Selecting a paper...")
        page.locator(".cursor-pointer").first.click()

        # Wait for Source Guide to start loading or show content
        page.wait_for_timeout(3000)

        # Take screenshot of Source Guide tab
        print("Taking screenshot of Guide...")
        page.screenshot(path="verification/knowledge_base_guide.png")

        # Switch to Audio Overview
        print("Switching to Audio Overview...")
        page.get_by_text("Audio Overview").click()
        page.wait_for_timeout(1000)
        page.screenshot(path="verification/knowledge_base_audio.png")

    except Exception as e:
        print(f"Error: {e}")
        page.screenshot(path="verification/error.png")
    finally:
        browser.close()

with sync_playwright() as playwright:
    run(playwright)
