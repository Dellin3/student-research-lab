import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

const routes = [
  '/',
  '/topic-narrowing',
  '/research-question-builder',
  '/investigation-planner',
  '/worksheet',
  '/case-studies',
]

test.describe('automated accessibility', () => {
  for (const route of routes) {
    test(`${route} has no serious or critical axe violations`, async ({ page }) => {
      await page.goto(route)
      const result = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze()
      const serious = result.violations.filter(({ impact }) =>
        ['serious', 'critical'].includes(impact))
      expect(serious).toEqual([])
    })
  }
})
