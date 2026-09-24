import { defineConfig, devices } from '@playwright/test';
import { loadEnvConfig } from '@next/env';

// Tests create throwaway users in Supabase, so they need the same env the
// app uses (.env.local), including SUPABASE_SERVICE_ROLE_KEY.
loadEnvConfig(process.cwd());

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  // Each test signs in a fresh user; keep concurrency modest so we stay
  // under Supabase's per-IP auth rate limits.
  workers: 4,
  timeout: 60_000,
  use: { baseURL: 'http://127.0.0.1:3019', trace: 'on-first-retry' },
  webServer: {
    command: 'npm run start -- -p 3019',
    url: 'http://127.0.0.1:3019',
    reuseExistingServer: false,
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
