import { test, expect } from '@playwright/test'

test('landing page loads correctly', async ({ page }) => {
  await page.goto('/')

  // Check main heading
  await expect(page.locator('h1')).toContainText('Turn Your Child Into the Hero')

  // Check CTA button - looking for "Start Creating Stories" for non-authenticated users
  await expect(page.locator('text=Start Creating Stories')).toBeVisible()

  // Check benefits section
  await expect(page.locator('text=Your Child as Hero')).toBeVisible()
  await expect(page.locator('text=AI-Generated Stories')).toBeVisible()
  await expect(page.locator('text=Print-Ready PDF')).toBeVisible()
})

test('navigation to signup page works', async ({ page }) => {
  await page.goto('/')
  
  // Click the CTA button
  await page.click('text=Start Creating Stories')
  
  // Should navigate to signup page (since user is not authenticated)
  await expect(page).toHaveURL('/signup')
}) 