import { defineConfig } from 'playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  workers: 1,
  retries: 0,
  timeout: 90000,
  expect: { timeout: 15000 },
  reporter: [['list'], ['json', { outputFile: '.workshop/e2e-results.json' }]],
  use: { baseURL: 'http://127.0.0.1:3100', browserName: 'chromium', channel: 'msedge', headless: true, screenshot: 'only-on-failure', trace: 'retain-on-failure' },
  webServer: { command: 'npm run dev', url: 'http://127.0.0.1:3100', reuseExistingServer: false, timeout: 120000 },
})
