import { defineConfig, devices } from '@playwright/test';

// Not astro's default 4321: that's where `astro dev` runs, and reusing it would test the dev server (slow, flaky).
const port = 4400;
const baseURL = `http://localhost:${port}/sneakers/`;

export default defineConfig({
  testDir: './e2e',
  use: { baseURL },
  webServer: {
    command: `SHOES_DIR=./e2e/fixtures/shoes pnpm build && pnpm preview --port ${port} --ignore-lock`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
