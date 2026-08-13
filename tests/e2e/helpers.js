import { expect } from '@playwright/test'
import { mkdirSync } from 'node:fs'
import { join } from 'node:path'

export const R1_ROUTES = [
  '/',
  '/learn',
  '/tools',
  '/research-question-builder',
  '/worksheet',
  '/case-studies',
]

export async function expectHealthyLayout(page) {
  await expect(page.locator('h1')).toBeVisible()

  const health = await page.evaluate(() => {
    const viewportWidth = window.innerWidth
    const skip = (element) =>
      element.closest('.skip-link, .sr-only')
      || element.matches('.skip-link, .sr-only')

    const horizontallyOffscreen = [...document.querySelectorAll('a, button, input, textarea, select, summary')]
      .filter((element) => {
        if (skip(element)) return false
        const style = getComputedStyle(element)
        const rect = element.getBoundingClientRect()
        return style.visibility !== 'hidden'
          && style.display !== 'none'
          && rect.width > 8
          && rect.height > 8
          && (rect.left < -8 || rect.right > viewportWidth + 8)
      })
      .map((element) => ({
        tag: element.tagName,
        text: element.textContent?.trim().slice(0, 60),
        rect: element.getBoundingClientRect().toJSON(),
      }))

    const overflowingBoxes = [...document.querySelectorAll('body *')]
      .filter((element) => {
        if (skip(element) || element.closest('svg')) return false
        const style = getComputedStyle(element)
        if (style.position === 'fixed' && element.matches('.skip-link')) return false
        const rect = element.getBoundingClientRect()
        return style.visibility !== 'hidden'
          && style.display !== 'none'
          && rect.width > 24
          && rect.right > viewportWidth + 8
      })
      .slice(0, 8)
      .map((element) => `${element.tagName}.${String(element.className).slice(0, 80)}`)

    const nestedScrollTraps = [...document.querySelectorAll('body *')]
      .filter((element) => {
        if (element.matches('textarea, select, pre, code')) return false
        const style = getComputedStyle(element)
        const rect = element.getBoundingClientRect()
        return ['auto', 'scroll'].includes(style.overflowY)
          && element.scrollHeight > element.clientHeight + 20
          && rect.height > window.innerHeight * 0.35
          && document.documentElement.scrollHeight > window.innerHeight + 40
      })
      .map((element) => `${element.tagName}.${element.className}`)

    return {
      scrollWidth: document.documentElement.scrollWidth,
      viewportWidth,
      horizontallyOffscreen,
      overflowingBoxes,
      nestedScrollTraps,
    }
  })

  expect(health.scrollWidth, 'page must not overflow horizontally').toBeLessThanOrEqual(health.viewportWidth + 2)
  expect(health.horizontallyOffscreen, 'interactive controls must stay on-screen').toEqual([])
  expect(health.overflowingBoxes, 'layout boxes must not extend past the viewport').toEqual([])
  expect(health.nestedScrollTraps, 'no nested full-panel scroll traps').toEqual([])
}

export async function capture(page, release, projectName, name) {
  const directory = join('artifacts', 'qa', release, projectName)
  mkdirSync(directory, { recursive: true })
  await page.screenshot({
    path: join(directory, `${name}.png`),
    fullPage: true,
    animations: 'disabled',
  })
}
