const { test, expect } = require("@playwright/test");

test.describe("Weather.com tests", () => {
  let browser;
  let context;
  let page;

  test.beforeAll(async () => {
    try {
      browser = await test.chromium.launch({ headless: false });
      context = await browser.newContext();
      page = await context.newPage();
    } catch (error) {
      console.error("Error during setup:", error);
    }
  });

  test.afterAll(async () => {
    try {
      if (browser) {
        await browser.close();
      }
    } catch (error) {
      console.error("Error during teardown:", error);
    }
  });

  test("Navigate to BBC Weather and search for a city", async () => {
    try {
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
    } catch (error) {
      console.error("Error in navigating and searching:", error);
    }
  });

  test("Take screenshot and generate PDF", async () => {
    try {
      await page.goto("https://www.bbc.com/weather/344979", {
        waitUntil: "networkidle",
        timeout: 60000,
      });

      await page.waitForSelector('#wr-forecast', { timeout: 10000 });

      await page.screenshot({ path: "weather.png" });

      await page.pdf({ path: "weather.pdf", format: "A4" });
    } catch (error) {
      console.error("Error in taking screenshot and generating PDF:", error);
    }
  });

  test("Handle multiple browser contexts", async () => {
    try {
      await page.goto("https://www.bbc.com/weather/")
      const context2 = await browser.newContext();
      const page2 = await context2.newPage();
      await page2.goto("https://www.bbc.com/weather/344979", {
        waitUntil: "load",
        timeout: 60000,
      });
      await context2.close();
    } catch (error) {
      console.error("Error in handling multiple contexts:", error);
    }
  });

  test("should display mocked weather data", async ({ page }) => {
    const mockWeatherData = JSON.parse(
      fs.readFileSync(path.join(__dirname, "mockedata.json"), "utf8")
    );

    await page.route(
      "https://weather-broker-cdn.api.bbci.co.uk/en/forecast/aggregated/344979",
      (route) => {
        console.log("Intercepted request:", route.request().url());
        route.fulfill({
          contentType: "application/json",
          body: JSON.stringify(mockWeatherData),
        });
      }
    );

    // Adding a listener for the response event
    page.on("response", (response) => {
      if (
        response
          .url()
          .includes(
            "https://weather-broker-cdn.api.bbci.co.uk/en/forecast/aggregated/344979"
          )
      ) {
        console.log("Response received:", response.url());
        response.json().then((data) => {
          console.log("Response data:", data);
        });
      }
    });

    await page.goto("https://www.bbc.com/weather/344979");

    await page.waitForSelector("#wr-forecast", { timeout: 60000 });

    await expect(
      page
        .locator("#wr-forecast div")
        .filter({ hasText: "Addis - Weather" })
        .first()
    ).toBeVisible();
  });

});
