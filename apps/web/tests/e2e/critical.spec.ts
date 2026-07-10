import { test, expect } from '@playwright/test';

test('landing page is reachable and has a primary CTA', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/server|check|uptime/i);
  await expect(page.getByRole('link', { name: /crear|registr|comenz/i }).first()).toBeVisible();
});

test('login route is reachable', async ({ page }) => {
  await page.goto('/auth/login');
  await expect(page).toHaveURL(/auth\/login/);
});
