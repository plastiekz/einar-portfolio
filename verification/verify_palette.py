from playwright.sync_api import sync_playwright, expect

def verify_palette():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Use 1920x1080 as per memory instructions
        context = browser.new_context(viewport={"width": 1920, "height": 1080})
        page = context.new_page()

        try:
            print("Navigating to app...")
            page.goto("http://localhost:10000")

            # Wait for Sidebar to load
            print("Waiting for sidebar...")
            page.wait_for_selector('text=SYNAPSE')

            # Navigate to Synapse Memory (Knowledge Base)
            print("Navigating to Synapse Memory...")
            page.get_by_role("button", name="Synapse Memory").click()

            # Wait for content to load
            print("Waiting for Knowledge Base content...")
            page.wait_for_selector('text=Neural Archive')

            print("Clicking 'Add External Source'...")
            page.get_by_role("button", name="Add External Source").click()

            # Verify Modal is visible
            modal = page.locator("h3:has-text('Add External Source')")
            expect(modal).to_be_visible()

            print("Verifying accessibility attributes...")

            # Verify Close Button has aria-label
            close_btn = page.locator("button[aria-label='Close']")
            expect(close_btn).to_be_visible()

            # Verify Inputs have IDs matching labels
            title_label = page.locator("label[for='source-title']")
            title_input = page.locator("input#source-title")

            expect(title_label).to_be_visible()
            expect(title_input).to_be_visible()

            content_label = page.locator("label[for='source-content']")
            content_input = page.locator("textarea#source-content")

            expect(content_label).to_be_visible()
            expect(content_input).to_be_visible()

            # Verify Required attributes
            expect(title_input).to_have_attribute("required", "")
            expect(content_input).to_have_attribute("required", "")

            print("Taking screenshot...")
            page.screenshot(path="verification_palette.png")
            print("Verification successful!")

        except Exception as e:
            print(f"Verification failed: {e}")
            page.screenshot(path="verification_palette_error.png")
            raise e
        finally:
            browser.close()

if __name__ == "__main__":
    verify_palette()
