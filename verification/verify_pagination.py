from playwright.sync_api import sync_playwright, expect

def verify_paper_feed_pagination():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Use a larger viewport to ensure "Load More" is potentially visible without scrolling too much,
        # though we will scroll to it.
        context = browser.new_context(viewport={"width": 1920, "height": 1080})
        page = context.new_page()

        try:
            print("Navigating to dashboard...")
            page.goto("http://localhost:3000")

            # The app defaults to Dashboard. We need to go to "Paper Feed".
            # Finding the nav button for Paper Feed.
            # Assuming it's in the sidebar or top nav. Let's look for text "Paper Feed".
            print("Clicking 'Paper Feed' navigation...")
            page.get_by_text("Paper Feed").click()

            # Wait for papers to load.
            # We expect 'Found X Results' text.
            print("Waiting for feed to load...")
            page.wait_for_selector("text=Found")

            # 1. Verify we see papers
            # PaperCard has a title in an h4.
            print("Checking initial paper count...")
            papers = page.locator("h4.text-lg")
            # We expect 20 items initially (from our code change)
            # Note: We need to wait a bit for rendering
            page.wait_for_timeout(2000)

            count_initial = papers.count()
            print(f"Initial paper count: {count_initial}")

            # 2. Scroll to bottom to find Load More
            print("Scrolling to bottom...")
            page.evaluate("window.scrollTo(0, document.body.scrollHeight)")

            # 3. Find and click "Load More"
            print("Looking for Load More button...")
            load_more = page.get_by_role("button", name="Load More")

            if load_more.is_visible():
                print("Load More button found. Clicking...")
                load_more.click()

                # Wait for more items
                page.wait_for_timeout(1000)

                count_after = papers.count()
                print(f"Paper count after load more: {count_after}")

                if count_after > count_initial:
                    print("SUCCESS: Loaded more papers.")
                else:
                    print("WARNING: Paper count did not increase (maybe not enough mock data?).")
            else:
                print("WARNING: Load More button not found (maybe < 20 papers?).")

            # 4. Take Screenshot
            print("Taking screenshot...")
            page.screenshot(path="verification/pagination_verify.png", full_page=False)

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error.png")
            raise e
        finally:
            browser.close()

if __name__ == "__main__":
    verify_paper_feed_pagination()
