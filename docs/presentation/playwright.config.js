const { defineConfig, devices } = require('@playwright/test')

module.exports = defineConfig({
  testDir: './tests',
  use: { baseURL: 'http://127.0.0.1:5500' },
  projects: [
    { name: 'chrome',  use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'safari',  use: { ...devices['Desktop Safari'] } },
    { name: 'mobile',  use: { ...devices['iPhone 14'] } },
    { name: 'tablet',  use: { ...devices['iPad Pro 11'] } },
  ],
})
