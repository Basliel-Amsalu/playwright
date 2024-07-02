const { test, expect } = require("@playwright/test");

test.describe("Weather.com tests", () => {
  let browser;
  let context;
  let page;

  test.beforeAll(async () => {
    browser = await test.chromium.launch({ headless: false });
    context = await browser.newContext();
    page = await context.newPage();
  });

  test.afterAll(async () => {
    await browser.close();
  });

  test("Navigate to Weather.com and search for a city", async () => {
    await page.goto("https://www.bbc.com/weather");

    await page.click("input#ls-c-search__input-label");
    await page.fill("input#ls-c-search__input-label", "Addis Ababa");
    await page.press("input#ls-c-search__input-label", "Enter");

    const option = page.getByRole("link", { name: "Addis Ababa, Ethiopia" });
    await expect(option).toBeVisible();
    await option.click();

    await expect(
      page
        .locator("#wr-forecast div")
        .filter({ hasText: "Addis Ababa - Weather" })
        .first()
    ).toBeVisible();
  });
});
