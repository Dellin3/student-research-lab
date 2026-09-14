import { expect, test } from '@playwright/test'
import { capture, expectHealthyLayout } from './helpers.js'

const routes = [
  ['/', 'home'],
  ['/start-here', 'start-research'],
  ['/start-here?example=humanities&step=try', 'shared-beginner-step'],
  ['/resources', 'programs'],
  ['/resources?view=mentors', 'mentors'],
  ['/resources?view=sources&q=data', 'filtered-sources'],
  ['/learn', 'learn'],
  ['/tools', 'tools'],
  ['/topic-narrowing', 'topic-narrowing'],
  ['/research-question-builder', 'question-builder'],
  ['/investigation-planner', 'investigation-planner'],
  ['/worksheet', 'research-record'],
  ['/ai-literature', 'ai-literature'],
  ['/build-a-project', 'build-project'],
  ['/outreach', 'outreach'],
  ['/case-studies', 'examples'],
]

test.describe('release route health', () => {
  for (const [route, name] of routes) {
    test(`${route} renders without runtime or responsive failures`, async ({ page }, testInfo) => {
      const errors = []
      page.on('console', (message) => {
        if (message.type() === 'error') errors.push(`console: ${message.text()}`)
      })
      page.on('pageerror', (error) => errors.push(`page: ${error.message}`))
      page.on('requestfailed', (request) => {
        if (request.resourceType() !== 'document' || request.url().includes(route)) {
          errors.push(`request: ${request.url()} ${request.failure()?.errorText || ''}`)
        }
      })

      const response = await page.goto(route)
      expect(response?.ok(), `${route} should resolve`).toBeTruthy()
      await expectHealthyLayout(page)
      await capture(page, 'r3', testInfo.project.name, name)
      expect(errors, `unexpected browser errors on ${route}`).toEqual([])
    })
  }
})
