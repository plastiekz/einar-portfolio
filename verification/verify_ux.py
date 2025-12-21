import asyncio
from playwright.async_api import async_playwright

async def verify_modal():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        # Verify 1920x1080 viewport to prevent overlay issues
        context = await browser.new_context(viewport={"width": 1920, "height": 1080})
        page = await context.new_page()

        # Navigate to the app (using the port from previous run or 4173 if vite preview)
        # We need to know the port. I will assume 4173 for now or check if a server is running.
        # Wait, I need to start the server first.
        # But I will write the script to expect port 10001 based on memory.
        try:
            await page.goto("http://localhost:10000", timeout=5000)
        except:
             await page.goto("http://localhost:10000")

        # 1. Click "Synapse Memory" (Knowledge Base)
        await page.get_by_role("button", name="Synapse Memory").click()

        # 2. Click "Add External Source"
        await page.get_by_role("button", name="Add External Source").click()

        # 3. Verify Modal is visible
        modal = page.locator("h3:has-text(\"Add External Source\")")
        await modal.wait_for()

        # 4. Take Screenshot
        await page.screenshot(path="verification/modal_verification.png")

        # 5. Accessibility Check (Quick check for attributes)
        # Check close button label
        close_btn = page.get_by_label("Close modal")
        if await close_btn.count() > 0:
            print("SUCCESS: Close button with aria-label found")
        else:
            print("FAILURE: Close button with aria-label NOT found")

        # Check input labels
        title_input = page.locator("input#source-title")
        if await title_input.count() > 0:
            print("SUCCESS: Input with id=source-title found")
        else:
             print("FAILURE: Input with id=source-title NOT found")

        await browser.close()

import asyncio
asyncio.run(verify_modal())
