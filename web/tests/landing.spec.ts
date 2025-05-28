import { test, expect } from '@playwright/test'

test('landing page loads correctly', async ({ page }) => {
  await page.goto('/')

  // Check main heading
  await expect(page.locator('h1')).toContainText('Turn Your Child Into the Hero')

  // Check CTA button
  await expect(page.locator('text=Create Your Book')).toBeVisible()

  // Check benefits section
  await expect(page.locator('text=AI-Generated Art')).toBeVisible()
  await expect(page.locator('text=Delivered in <1h')).toBeVisible()
  await expect(page.locator('text=Print-Ready PDF')).toBeVisible()
})

test('navigation to create page works', async ({ page }) => {
  await page.goto('/')
  
  // Click the CTA button
  await page.click('text=Create Your Book')
  
  // Should navigate to create page
  await expect(page).toHaveURL('/create')
  
  // Should show step 1 of onboarding
  await expect(page.locator('text=Step 1 of 4')).toBeVisible()
  await expect(page.locator('text=Upload Your Child\'s Photo')).toBeVisible()
}) 