# Test info

- Name: landing page loads correctly
- Location: /Users/ryanheger/storybook-next/web/tests/landing.spec.ts:3:5

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
>  3 | test('landing page loads correctly', async ({ page }) => {
     |     ^ Error: browserType.launch: Executable doesn't exist at /Users/ryanheger/Library/Caches/ms-playwright/chromium_headless_shell-1169/chrome-mac/headless_shell
   4 |   await page.goto('/')
   5 |
   6 |   // Check main heading
   7 |   await expect(page.locator('h1')).toContainText('Turn Your Child Into the Hero')
   8 |
   9 |   // Check CTA button - looking for "Start Creating Stories" for non-authenticated users
  10 |   await expect(page.locator('text=Start Creating Stories')).toBeVisible()
  11 |
  12 |   // Check benefits section
  13 |   await expect(page.locator('text=Your Child as Hero')).toBeVisible()
  14 |   await expect(page.locator('text=AI-Generated Stories')).toBeVisible()
  15 |   await expect(page.locator('text=Print-Ready PDF')).toBeVisible()
  16 | })
  17 |
  18 | test('navigation to signup page works', async ({ page }) => {
  19 |   await page.goto('/')
  20 |   
  21 |   // Click the CTA button
  22 |   await page.click('text=Start Creating Stories')
  23 |   
  24 |   // Should navigate to signup page (since user is not authenticated)
  25 |   await expect(page).toHaveURL('/signup')
  26 | }) 
```