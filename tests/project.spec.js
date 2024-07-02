const { test, expect } = require("@playwright/test");
const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");

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

      await page.waitForSelector("#wr-forecast", { timeout: 10000 });

      await page.screenshot({ path: "weather.png" });

      await page.pdf({ path: "weather.pdf", format: "A4" });
    } catch (error) {
      console.error("Error in taking screenshot and generating PDF:", error);
    }
  });

  test("Handle multiple browser contexts", async () => {
    try {
      await page.goto("https://www.bbc.com/weather/");
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

  test("Extract weather information and generate PDF", async () => {
    try {
      await page.goto("https://www.bbc.com/weather/344979");

      await page.waitForSelector(".wr-day-container", { timeout: 10000 });

      const weatherData = [];
      const listItems = await page.$$("li.wr-time-slot");

      for (let listItem of listItems) {
        const listItemButton = await listItem.$("button.wr-time-slot__inner");
        await listItemButton.click();

        const time = await listItem.$eval(".wr-time-slot-primary__time", (el) =>
          el.textContent.trim()
        );
        const weatherDescription = await listItem.$eval(
          ".wr-time-slot-primary__weather-type-description",
          (el) => el.textContent.trim()
        );
        const temperature = await listItem.$eval(
          ".wr-value--temperature--c",
          (el) => el.textContent.trim()
        );
        const precipitation = await listItem.$eval(
          ".wr-time-slot-primary__precipitation div.wr-u-font-weight-500",
          (el) => el.textContent.trim()
        );
        const windSpeed = await listItem.$eval(
          ".wr-wind-speed__description",
          (el) => el.textContent.trim()
        );

        const humidity = await listItem.$eval(
          "dt:has-text('Humidity') + dd",
          (el) => el.textContent.trim()
        );
        const pressure = await listItem.$eval(
          "dt:has-text('Pressure') + dd",
          (el) => el.textContent.trim()
        );
        const visibility = await listItem.$eval(
          "dt:has-text('Visibility') + dd",
          (el) => el.textContent.trim()
        );
        const feelsLike = await listItem.$eval(
          ".wr-time-slot-secondary__feels-like-temperature-value",
          (el) => el.textContent.trim()
        );

        weatherData.push({
          time,
          weatherDescription,
          temperature,
          precipitation,
          windSpeed,
          humidity,
          pressure,
          visibility,
          feelsLike,
        });
      }

      console.log(weatherData);

      const doc = new PDFDocument();
      doc.pipe(fs.createWriteStream("weather-details.pdf"));

      weatherData.forEach((data, index) => {
        doc.text(`Time Slot ${index + 1}`);
        doc.text(`Time: ${data.time}`);
        doc.text(`Weather: ${data.weatherDescription}`);
        doc.text(`Temperature: ${data.temperature}`);
        doc.text(`Precipitation: ${data.precipitation}`);
        doc.text(`Wind Speed: ${data.windSpeed}`);
        doc.text(`Humidity: ${data.humidity}`);
        doc.text(`Pressure: ${data.pressure}`);
        doc.text(`Visibility: ${data.visibility}`);
        doc.text(`Feels Like: ${data.feelsLike}`);
        doc.addPage();
      });

      doc.end();
    } catch (error) {
      console.error(
        "Error in extracting weather information and generating PDF:",
        error
      );
    }
  });

  test("pagination and scrapping", async () => {
    await page.goto("https://www.bbc.com");

    async function scrapePage(page) {
      const items = await page.$$eval("p", (elements) =>
        elements.map((element) => element.textContent.trim())
      );
      console.log(`Items: ${items.join(", ")}`);
    }

    const links = await page.$$eval(
      'a[data-testid="internal-link"]',
      (elements) => elements.map((element) => element.href)
    );

    console.log(links);
    for (let link of links) {
      await page.goto(link);
      await scrapePage(page);
    }
  });
});
