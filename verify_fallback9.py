from playwright.sync_api import Page, expect, sync_playwright

def test_math_trainer(page: Page):
  # 1. Arrange: Go to the app
  page.goto("http://localhost:8000/?lang=ru")

  # 2. Wait for settings screen to be visible
  page.wait_for_selector(".settings-screen")

  # Change target number to 9
  page.locator("select").select_option("9")

  # 3. Fill settings and submit to confirmation
  page.get_by_role("button", name="Сохранить настройки").click()

  # 4. Game confirmation screen
  page.wait_for_selector(".confirmation-screen")
  page.click(".confirmation-screen button:nth-child(2)")

  # 5. Game screen should load
  page.wait_for_selector(".game-screen")
  page.wait_for_timeout(2000)

  # 6. Screenshot the game screen
  page.screenshot(path="/home/jules/verification/fallback9.png", full_page=True)

if __name__ == "__main__":
  with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1200, "height": 800})
    try:
      test_math_trainer(page)
    finally:
      browser.close()
