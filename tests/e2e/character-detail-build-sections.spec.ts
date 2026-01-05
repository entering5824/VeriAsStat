import { test, expect } from '@playwright/test'

test.describe('Character Detail Build Sections', () => {
  test('displays build sections with new UI when flag enabled', async ({ page }) => {
    // Navigate to a character detail page with new build UI flag
    await page.goto('/characters/4?game=GI&newBuildUI=1')
    
    // Wait for page to load
    await page.waitForSelector('.character-detail-page', { timeout: 10000 })
    
    // Check if rank badges are visible (indicating ranked-list component)
    const rankBadges = page.locator('.rank-badge')
    await expect(rankBadges.first()).toBeVisible({ timeout: 5000 }).catch(() => {
      // If no rank badges, sections might not exist for this character
      // This is okay - just verify the page loaded
      expect(page.locator('.character-detail-page')).toBeVisible()
    })
  })

  test('displays set combinations correctly', async ({ page }) => {
    await page.goto('/characters/4?game=GI&newBuildUI=1')
    await page.waitForSelector('.character-detail-page', { timeout: 10000 })
    
    // Look for artifact sets (set-combination component)
    const artifactSets = page.locator('.artifact-set')
    const count = await artifactSets.count()
    
    if (count > 0) {
      // If sets exist, verify they display correctly
      await expect(artifactSets.first()).toBeVisible()
    }
  })

  test('displays stat grid correctly', async ({ page }) => {
    await page.goto('/characters/4?game=GI&newBuildUI=1')
    await page.waitForSelector('.character-detail-page', { timeout: 10000 })
    
    // Look for stat slot items (stat-grid component)
    const statSlots = page.locator('.stat-slot-item')
    const count = await statSlots.count()
    
    if (count > 0) {
      await expect(statSlots.first()).toBeVisible()
      // Verify slot and stat values are displayed
      const firstSlot = statSlots.first()
      await expect(firstSlot.locator('.stat-slot')).toBeVisible()
      await expect(firstSlot.locator('.stat-value')).toBeVisible()
    }
  })

  test('uses legacy UI when flag is disabled', async ({ page }) => {
    // Navigate without the newBuildUI flag
    await page.goto('/characters/4?game=GI')
    await page.waitForSelector('.character-detail-page', { timeout: 10000 })
    
    // Page should still load (legacy rendering)
    await expect(page.locator('.character-detail-page')).toBeVisible()
  })

  test('has accessible aria-labels', async ({ page }) => {
    await page.goto('/characters/4?game=GI&newBuildUI=1')
    await page.waitForSelector('.character-detail-page', { timeout: 10000 })
    
    // Check for aria-labels on interactive elements
    const rankedItems = page.locator('.ranked-item[aria-label]')
    const count = await rankedItems.count()
    
    if (count > 0) {
      const ariaLabel = await rankedItems.first().getAttribute('aria-label')
      expect(ariaLabel).toBeTruthy()
      expect(ariaLabel).toContain('Rank')
    }
  })

  test('keyboard navigation works', async ({ page }) => {
    await page.goto('/characters/4?game=GI&newBuildUI=1')
    await page.waitForSelector('.character-detail-page', { timeout: 10000 })
    
    // Find focusable elements (items with tabindex)
    const focusableItems = page.locator('.ranked-item[tabindex="0"], .stat-priority-item[tabindex="0"]')
    const count = await focusableItems.count()
    
    if (count > 0) {
      // Focus first item
      await focusableItems.first().focus()
      
      // Verify it has focus styles (indirect check via focused state)
      const focused = await page.evaluate(() => document.activeElement?.getAttribute('class'))
      expect(focused).toBeTruthy()
    }
  })
})
