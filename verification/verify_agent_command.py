from playwright.sync_api import sync_playwright, expect

def verify_ux_changes():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1920, "height": 1080})

        try:
            page.goto("http://localhost:4173")

            # Use specific role to click sidebar button
            page.get_by_role("button", name="Agent Command").click()

            # Wait for heading
            expect(page.get_by_role("heading", name="AGENT COMMAND")).to_be_visible()

            # 3. Verify Vanguard Labels
            print("Verifying Vanguard Labels...")
            input_el = page.get_by_label("Target Designation")
            expect(input_el).to_be_visible()

            # Click the label specifically
            page.get_by_text("Target Designation", exact=True).click()
            active_element_id = page.evaluate("document.activeElement.id")
            if active_element_id != "vanguard-target":
                print(f"FAILURE: Clicking 'Target Designation' did not focus 'vanguard-target'. Focused ID: {active_element_id}")
            else:
                print("SUCCESS: Clicking 'Target Designation' focused the correct input.")

            # 4. Check for log role
            print("Verifying Log Role...")
            log_role = page.locator('div[role="log"]')
            expect(log_role).to_have_count(1)
            print("SUCCESS: Found role='log' container.")

            # 5. Screenshot
            page.screenshot(path="verification/agent_command_vanguard.png")

            # 6. Switch to Field Ops
            print("Switching to Field Ops...")
            page.get_by_text("FIELD OPS").click()

            # 7. Verify Field Ops Labels
            print("Verifying Field Ops Labels...")
            input_el_ops = page.get_by_label("Operation Query")
            expect(input_el_ops).to_be_visible()

            page.get_by_text("Operation Query").click()
            active_element_id = page.evaluate("document.activeElement.id")
            if active_element_id != "field-query":
                 print(f"FAILURE: Clicking 'Operation Query' did not focus 'field-query'. Focused ID: {active_element_id}")
            else:
                 print("SUCCESS: Clicking 'Operation Query' focused the correct input.")

            # 8. Screenshot
            page.screenshot(path="verification/agent_command_fieldops.png")

        except Exception as e:
            print(f"Error during verification: {e}")
            page.screenshot(path="verification/error.png")
            raise e
        finally:
            browser.close()

if __name__ == "__main__":
    verify_ux_changes()
