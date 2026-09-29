import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E configuration for BIS Intelligence Platform.
 * Tests target the deployed Azure Container App production URL by default,
 * or localhost:3000 if PLAYWRIGHT_TEST_BASE_URL is explicitly set.
 */
export default defineConfig({
  testDir: './tests/e2e',
  timeout: 90 * 1000,
  expect: {
    timeout: 20 * 1000,
  },
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: 1,
  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'playwright-report/test-results.json' }],
  ],
  use: {
    baseURL:
      process.env.PLAYWRIGHT_TEST_BASE_URL ||
      'https://bis-frontend-korea.yellowmeadow-d3173c9a.koreacentral.azurecontainerapps.io',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    headless: true,
    ignoreHTTPSErrors: true,
    viewport: { width: 1280, height: 720 },
    actionTimeout: 20 * 1000,
    navigationTimeout: 30 * 1000,
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        channel: 'chrome',
      },
    },
  ],
});
