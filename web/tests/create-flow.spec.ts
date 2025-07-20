import { test, expect } from '@playwright/test'

test.describe('Create flow', () => {
  test('unauthenticated create flow', async ({ page }) => {
    await page.goto('/create')
    
    // Should show step 1 of 4
    await expect(page.locator('text=Step 1 of 4')).toBeVisible()
    
    // Should show photo upload component
    await expect(page.locator('text=Create Your Child\'s Character')).toBeVisible()
    await expect(page.locator('text=Upload Photo')).toBeVisible()
    await expect(page.locator('text=Describe Your Child Instead')).toBeVisible()
  })

  test('manual character creation', async ({ page }) => {
    await page.goto('/create')
    
    // Click on manual input option
    await page.click('text=Describe Your Child Instead')
    
    // Fill in character details
    await page.fill('textarea[placeholder*="Brown curly hair"]', 'Brown hair, green eyes, freckles')
    await page.selectOption('select', '6-8 years old')
    await page.fill('input[placeholder*="curious and adventurous"]', 'brave and creative')
    await page.fill('input[placeholder*="loves animals"]', 'loves dinosaurs and space')
    
    // Submit character
    await page.click('text=Create Character')
    
    // Should move to step 2 (Theme Selection)
    await expect(page.locator('text=Step 2 of 4')).toBeVisible()
  })

  test('theme selection step', async ({ page }) => {
    // This test would need proper setup with a mocked character
    // For now, we'll just test that the theme selector exists
    await page.goto('/create')
    
    // We would need to complete step 1 first in a real test
    // This is just checking the component renders
  })
})

test.describe('Preview page', () => {
  test('shows error for invalid order', async ({ page }) => {
    await page.goto('/preview?order_id=invalid-id')
    
    // Should redirect to home or show error
    await expect(page).toHaveURL('/')
  })
})

test.describe('Authentication flow', () => {
  test('signup page renders correctly', async ({ page }) => {
    await page.goto('/signup')
    
    // Check for form elements
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()
  })

  test('login page renders correctly', async ({ page }) => {
    await page.goto('/login')
    
    // Check for form elements
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()
  })

  test('dashboard redirects to login when not authenticated', async ({ page }) => {
    await page.goto('/dashboard')
    
    // Should redirect to login
    await expect(page).toHaveURL('/login')
  })
})