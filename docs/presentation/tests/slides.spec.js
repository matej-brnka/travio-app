const { test, expect } = require('@playwright/test')

test('prezentace se nacte', async ({ page }) => {
  await page.goto('/docs/presentation/index.html')
  await expect(page.locator('.reveal')).toBeVisible()
})

test('screenshoty vsech slidu', async ({ page }) => {
  await page.goto('/docs/presentation/index.html')

  for (let i = 0; i < 13; i++) {
    await page.screenshot({ path: `screenshots/slide-${i}.png`, fullPage: false })
    await page.keyboard.press('ArrowRight')
    await page.waitForTimeout(400)
  }
})
