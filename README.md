## BBC/BBC weather Tests with Playwright
This repository contains automated tests for weather-related functionalities on BBC/BBC Weather using Playwright. These tests include navigation, data extraction, PDF generation, and API mocking.

## Prerequisites
- Node.js
- npm
- Playwright
- PDFKit
## Setup

1. **Clone the repository:**

```bash
git clone https://github.com/Basliel-Amsalu/playwright.git
cd playwright
```

## Install dependencies:
```bash
npm install
```

## Running the Tests
1 Run all tests:
```bash
npx playwright test
```
2 Run a specific test:
```bash
npx playwright test tests/project.spec.js --grep "@test-name"
```
## Test Descriptions

1. Navigate to BBC Weather and Search for a City
This test navigates to BBC Weather, searches for a city (Addis Ababa), and verifies that the correct page is displayed.

2. Take Screenshot and Generate PDF
This test navigates to the Addis Ababa weather page, takes a screenshot, and generates a PDF of the page.

3. Handle Multiple Browser Contexts and Interact with Elements
This test creates multiple browser contexts, navigates to the weather page, and interacts with elements (e.g., changing temperature units).

4. Mock Weather API Data
This test mocks the weather API response with predefined data from mockedata.json and verifies the mocked data is displayed correctly.

5. Extract Weather Information and Document in PDF
This test extracts detailed weather information from the page and documents it in a PDF file.

6. Paginate Through Links and Extract Information
This test navigates through multiple links on the BBC website, extracts paragraph text from each page, and documents it in a PDF file.

## File Structure
- tests/project.spec.js: Contains the test cases.
- mockedata.json: Contains mock data for the weather API.
- weather.png: Screenshot of the weather page.
- weather.pdf: PDF of the weather page.
- weather-details.pdf: PDF document with extracted weather details.
- scraped_data.pdf: PDF document with extracted information from paginated links.
