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
    await page.goto("https://www.bbc.com/weather", {
      waitUntil: "networkidle",
      timeout: 60000,
    });

    const searchBar = await page.waitForSelector(
      "input#ls-c-search__input-label",
      { timeout: 10000 }
    );

    await searchBar.click();
    await searchBar.fill("Addis Ababa");
    await searchBar.press("Enter");

    const option = page.getByRole("link", { name: "Addis Ababa, Ethiopia" });
    await expect(option).toBeVisible();
    await option.click();

    await page.waitForSelector("#wr-forecast", { timeout: 10000 });

    await expect(
      page
        .locator("#wr-forecast div")
        .filter({ hasText: "Addis Ababa - Weather" })
        .first()
    ).toBeVisible();
  });
});
