import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  use: { baseURL: 'http://127.0.0.1:3019', trace: 'on-first-retry' },
  webServer: {
    command: 'npm run start -- -p 3019',
    url: 'http://127.0.0.1:3019',
    reuseExistingServer: false,
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
