import { defineConfig } from '@playwright/test'

const viewports = {
  desktop: { width: 1440, height: 1000 },
  tablet: { width: 1024, height: 1366 },
  mobile: { width: 390, height: 844 },
}

export default defineConfig({
  testDir: './tests/e2e',
  outputDir: './artifacts/qa/results',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [['list'], ['html', { outputFolder: './artifacts/qa/report', open: 'never' }]],
  use: {
    baseURL: 'http://127.0.0.1:5173',
    browserName: 'chromium',
    colorScheme: 'light',
    reducedMotion: 'reduce',
    trace: 'retain-on-failure',
    video: 'retain-on-failure',
  },
  projects: Object.entries(viewports).map(([name, viewport]) => ({
    name,
    use: { viewport },
  })),
  webServer: {
    command: 'npm run dev -- --host 127.0.0.1',
    url: 'http://127.0.0.1:5173',
    reuseExistingServer: true,
    timeout: 30_000,
  },
})
