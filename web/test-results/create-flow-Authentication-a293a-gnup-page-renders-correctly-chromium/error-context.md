# Test info

- Name: Authentication flow >> signup page renders correctly
- Location: /Users/ryanheger/storybook-next/web/tests/create-flow.spec.ts:55:7

# Error details

```
Error: browserType.launch: Executable doesn't exist at /Users/ryanheger/Library/Caches/ms-playwright/chromium_headless_shell-1169/chrome-mac/headless_shell
╔═════════════════════════════════════════════════════════════════════════╗
║ Looks like Playwright Test or Playwright was just installed or updated. ║
║ Please run the following command to download new browsers:              ║
║                                                                         ║
║     pnpm exec playwright install                                        ║
║                                                                         ║
║ <3 Playwright Team                                                      ║
╚═════════════════════════════════════════════════════════════════════════╝
```

# Test source

```ts
   1 | import { test, expect } from '@playwright/test'
   2 |
   3 | test.describe('Create flow', () => {
   4 |   test('unauthenticated create flow', async ({ page }) => {
   5 |     await page.goto('/create')
   6 |     
   7 |     // Should show step 1 of 4
   8 |     await expect(page.locator('text=Step 1 of 4')).toBeVisible()
   9 |     
  10 |     // Should show photo upload component
  11 |     await expect(page.locator('text=Create Your Child\'s Character')).toBeVisible()
  12 |     await expect(page.locator('text=Upload Photo')).toBeVisible()
  13 |     await expect(page.locator('text=Describe Your Child Instead')).toBeVisible()
  14 |   })
  15 |
  16 |   test('manual character creation', async ({ page }) => {
  17 |     await page.goto('/create')
  18 |     
  19 |     // Click on manual input option
  20 |     await page.click('text=Describe Your Child Instead')
  21 |     
  22 |     // Fill in character details
  23 |     await page.fill('textarea[placeholder*="Brown curly hair"]', 'Brown hair, green eyes, freckles')
  24 |     await page.selectOption('select', '6-8 years old')
  25 |     await page.fill('input[placeholder*="curious and adventurous"]', 'brave and creative')
  26 |     await page.fill('input[placeholder*="loves animals"]', 'loves dinosaurs and space')
  27 |     
  28 |     // Submit character
  29 |     await page.click('text=Create Character')
  30 |     
  31 |     // Should move to step 2 (Theme Selection)
  32 |     await expect(page.locator('text=Step 2 of 4')).toBeVisible()
  33 |   })
  34 |
  35 |   test('theme selection step', async ({ page }) => {
  36 |     // This test would need proper setup with a mocked character
  37 |     // For now, we'll just test that the theme selector exists
  38 |     await page.goto('/create')
  39 |     
  40 |     // We would need to complete step 1 first in a real test
  41 |     // This is just checking the component renders
  42 |   })
  43 | })
  44 |
  45 | test.describe('Preview page', () => {
  46 |   test('shows error for invalid order', async ({ page }) => {
  47 |     await page.goto('/preview?order_id=invalid-id')
  48 |     
  49 |     // Should redirect to home or show error
  50 |     await expect(page).toHaveURL('/')
  51 |   })
  52 | })
  53 |
  54 | test.describe('Authentication flow', () => {
> 55 |   test('signup page renders correctly', async ({ page }) => {
     |       ^ Error: browserType.launch: Executable doesn't exist at /Users/ryanheger/Library/Caches/ms-playwright/chromium_headless_shell-1169/chrome-mac/headless_shell
  56 |     await page.goto('/signup')
  57 |     
  58 |     // Check for form elements
  59 |     await expect(page.locator('input[type="email"]')).toBeVisible()
  60 |     await expect(page.locator('input[type="password"]')).toBeVisible()
  61 |     await expect(page.locator('button[type="submit"]')).toBeVisible()
  62 |   })
  63 |
  64 |   test('login page renders correctly', async ({ page }) => {
  65 |     await page.goto('/login')
  66 |     
  67 |     // Check for form elements
  68 |     await expect(page.locator('input[type="email"]')).toBeVisible()
  69 |     await expect(page.locator('input[type="password"]')).toBeVisible()
  70 |     await expect(page.locator('button[type="submit"]')).toBeVisible()
  71 |   })
  72 |
  73 |   test('dashboard redirects to login when not authenticated', async ({ page }) => {
  74 |     await page.goto('/dashboard')
  75 |     
  76 |     // Should redirect to login
  77 |     await expect(page).toHaveURL('/login')
  78 |   })
  79 | })
```