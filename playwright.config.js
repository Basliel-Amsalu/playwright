// playwright.config.ts
module.exports = {
  // The directory where the tests are located
  testDir: "./tests",
  // Specify the browsers to run tests in
  projects: [
    {
      name: "chromium",
      use: { browserName: "chromium" },
    },
    {
      name: "firefox",
      use: { browserName: "firefox" },
    },
    {
      name: "webkit",
      use: { browserName: "webkit" },
    },
  ],
  // Global timeout for each test
  timeout: 180000, // 60 seconds
  // Retry configuration
  retries: 2,
  // Test reporter
  reporter: [["list"], ["json", { outputFile: "results.json" }]],
};
