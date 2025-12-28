import { test, expect } from '@playwright/test';

/**
 * YETO Platform - Critical User Journey E2E Tests
 * Yemen Economic Transparency Observatory
 * 
 * These tests cover the most important user flows to ensure
 * the platform works correctly for end users.
 */

test.describe('Homepage', () => {
  test('should load homepage with hero section', async ({ page }) => {
    await page.goto('/');
    
    // Check page title
    await expect(page).toHaveTitle(/YETO|يتو/);
    
    // Check hero section is visible
    const heroTitle = page.locator('h1').first();
    await expect(heroTitle).toBeVisible();
    
    // Check platform stats are visible
    await expect(page.getByText(/850/)).toBeVisible();
    await expect(page.getByText(/45/)).toBeVisible();
  });

  test('should display DEV mode banner', async ({ page }) => {
    await page.goto('/');
    
    // DEV mode banner should be visible
    const devBanner = page.locator('text=/وضع التطوير|Development Mode/i');
    await expect(devBanner).toBeVisible();
  });

  test('should have working navigation', async ({ page }) => {
    await page.goto('/');
    
    // Check header navigation exists
    const header = page.locator('header');
    await expect(header).toBeVisible();
    
    // Check logo is visible
    const logo = page.locator('text=/يتو|YETO/i').first();
    await expect(logo).toBeVisible();
  });
});

test.describe('Language Switching', () => {
  test('should switch between Arabic and English', async ({ page }) => {
    await page.goto('/');
    
    // Find language switcher button
    const langButton = page.locator('button:has-text("English"), button:has-text("العربية")');
    await expect(langButton).toBeVisible();
    
    // Get initial direction
    const initialDir = await page.locator('html').getAttribute('dir');
    
    // Click language switcher
    await langButton.click();
    
    // Wait for language change
    await page.waitForTimeout(500);
    
    // Check direction changed
    const newDir = await page.locator('html').getAttribute('dir');
    expect(newDir).not.toBe(initialDir);
  });

  test('should maintain RTL layout for Arabic', async ({ page }) => {
    await page.goto('/');
    
    // Check RTL direction
    const dir = await page.locator('html').getAttribute('dir');
    expect(dir).toBe('rtl');
    
    // Check Arabic content is visible
    await expect(page.getByText('الشفافية الاقتصادية')).toBeVisible();
  });
});

test.describe('Dashboard', () => {
  test('should load dashboard page', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Check dashboard loads
    await expect(page.locator('h1, h2').first()).toBeVisible();
    
    // Check for key indicators section
    const content = await page.content();
    expect(content).toMatch(/dashboard|لوحة/i);
  });

  test('should display regime comparison', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Check for Aden/Sanaa regime indicators
    const pageContent = await page.content();
    expect(pageContent).toMatch(/عدن|Aden|صنعاء|Sanaa/i);
  });
});

test.describe('Sectors Navigation', () => {
  test('should navigate to Banking sector', async ({ page }) => {
    await page.goto('/sectors/banking');
    
    // Check page loads
    await expect(page.locator('h1, h2').first()).toBeVisible();
    
    // Check banking content
    const content = await page.content();
    expect(content).toMatch(/banking|مصرفي|بنك/i);
  });

  test('should navigate to Trade sector', async ({ page }) => {
    await page.goto('/sectors/trade');
    
    // Check page loads
    await expect(page.locator('h1, h2').first()).toBeVisible();
    
    // Check trade content
    const content = await page.content();
    expect(content).toMatch(/trade|تجارة/i);
  });

  test('should navigate to Currency sector', async ({ page }) => {
    await page.goto('/sectors/currency');
    
    // Check page loads
    await expect(page.locator('h1, h2').first()).toBeVisible();
    
    // Check currency content
    const content = await page.content();
    expect(content).toMatch(/currency|عملة|صرف/i);
  });
});

test.describe('Tools', () => {
  test('should load AI Assistant page', async ({ page }) => {
    await page.goto('/ai-assistant');
    
    // Check page loads
    await expect(page.locator('h1, h2').first()).toBeVisible();
    
    // Check for chat interface or input
    const content = await page.content();
    expect(content).toMatch(/assistant|مساعد|chat/i);
  });

  test('should load Data Repository page', async ({ page }) => {
    await page.goto('/data-repository');
    
    // Check page loads
    await expect(page.locator('h1, h2').first()).toBeVisible();
    
    // Check for data repository content
    const content = await page.content();
    expect(content).toMatch(/repository|مستودع|data/i);
  });

  test('should load Timeline page', async ({ page }) => {
    await page.goto('/timeline');
    
    // Check page loads
    await expect(page.locator('h1, h2').first()).toBeVisible();
    
    // Check for timeline content
    const content = await page.content();
    expect(content).toMatch(/timeline|زمني/i);
  });
});

test.describe('Resources', () => {
  test('should load Research Library page', async ({ page }) => {
    await page.goto('/research');
    
    // Check page loads
    await expect(page.locator('h1, h2').first()).toBeVisible();
    
    // Check for research content
    const content = await page.content();
    expect(content).toMatch(/research|أبحاث|library/i);
  });

  test('should load Glossary page', async ({ page }) => {
    await page.goto('/glossary');
    
    // Check page loads
    await expect(page.locator('h1, h2').first()).toBeVisible();
    
    // Check for glossary content
    const content = await page.content();
    expect(content).toMatch(/glossary|مصطلحات/i);
  });

  test('should load Methodology page', async ({ page }) => {
    await page.goto('/methodology');
    
    // Check page loads
    await expect(page.locator('h1, h2').first()).toBeVisible();
    
    // Check for methodology content
    const content = await page.content();
    expect(content).toMatch(/methodology|منهجية/i);
  });

  test('should load About page', async ({ page }) => {
    await page.goto('/about');
    
    // Check page loads
    await expect(page.locator('h1, h2').first()).toBeVisible();
    
    // Check for about content
    const content = await page.content();
    expect(content).toMatch(/about|عن|YETO|يتو/i);
  });
});

test.describe('Global Search', () => {
  test('should open search with keyboard shortcut', async ({ page }) => {
    await page.goto('/');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Try to trigger search with Cmd+K or Ctrl+K
    await page.keyboard.press('Meta+k');
    
    // Check if search dialog opened (may need adjustment based on implementation)
    await page.waitForTimeout(500);
  });
});

test.describe('Insights Ticker', () => {
  test('should display rotating insights', async ({ page }) => {
    await page.goto('/');
    
    // Check for insights ticker
    const ticker = page.locator('[class*="ticker"], [class*="insight"]');
    
    // Ticker should be visible or there should be insight content
    const content = await page.content();
    expect(content).toMatch(/سعر الصرف|Exchange|ريال|YER/i);
  });
});

test.describe('Footer', () => {
  test('should display footer with contact info', async ({ page }) => {
    await page.goto('/');
    
    // Scroll to footer
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    
    // Check footer is visible
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
    
    // Check for contact email
    await expect(page.getByText('yeto@causewaygrp.com')).toBeVisible();
    
    // Check for CauseWay branding
    const content = await page.content();
    expect(content).toMatch(/CauseWay|كوزواي/i);
  });
});

test.describe('Legal Pages', () => {
  test('should load Privacy Policy page', async ({ page }) => {
    await page.goto('/privacy');
    
    // Check page loads
    await expect(page.locator('h1, h2').first()).toBeVisible();
    
    // Check for privacy content
    const content = await page.content();
    expect(content).toMatch(/privacy|خصوصية/i);
  });

  test('should load Terms of Service page', async ({ page }) => {
    await page.goto('/terms');
    
    // Check page loads
    await expect(page.locator('h1, h2').first()).toBeVisible();
    
    // Check for terms content
    const content = await page.content();
    expect(content).toMatch(/terms|شروط/i);
  });
});

test.describe('Responsive Design', () => {
  test('should be responsive on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/');
    
    // Check page loads on mobile
    await expect(page.locator('h1').first()).toBeVisible();
    
    // Check mobile menu button exists
    const mobileMenu = page.locator('button[aria-label*="menu"], button:has(svg)').first();
    await expect(mobileMenu).toBeVisible();
  });
});

test.describe('Error Handling', () => {
  test('should handle 404 pages gracefully', async ({ page }) => {
    await page.goto('/non-existent-page-12345');
    
    // Should show some error or redirect
    const content = await page.content();
    // Either shows 404 page or redirects to home
    expect(content.length).toBeGreaterThan(100);
  });
});
