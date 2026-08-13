import { expect, test } from '@playwright/test'
import { capture, expectHealthyLayout, R1_ROUTES } from './helpers.js'

const routeName = (route) => route === '/' ? 'home' : route.slice(1).replaceAll('/', '-')

async function resetStorage(page) {
  await page.goto('/')
  await page.evaluate(() => window.localStorage.clear())
}

async function loadExample(page, name) {
  await page.goto('/research-question-builder')
  await page.locator('.qb-example-chip').filter({ hasText: name }).click()
}

async function openBuilderStage(page, name) {
  await page.locator('.qb-progress-step').filter({ hasText: name }).click()
}

test.describe('R1 product acceptance', () => {
  for (const route of R1_ROUTES) {
    test(`${route} has healthy layout and captured state`, async ({ page }, testInfo) => {
      await page.goto(route)
      await expectHealthyLayout(page)

      const menu = page.getByRole('button', { name: 'Open navigation' })
      if (await menu.isVisible()) {
        await menu.click()
        await expect(page.getByRole('navigation', { name: 'Primary navigation' })).toBeVisible()
        await expectHealthyLayout(page)
      }

      await capture(page, 'r1', testInfo.project.name, routeName(route))
    })
  }

  test('homepage field examples keep a readable desktop measure', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop')
    await page.goto('/')
    const widths = await page.locator('.field-mode').evaluateAll((items) =>
      items.map((item) => item.getBoundingClientRect().width),
    )
    expect(widths).toHaveLength(5)
    expect(Math.min(...widths)).toBeGreaterThan(300)
    const textWidths = await page.locator('.field-mode > p, .worked-example p, .real-example p').evaluateAll((items) =>
      items.map((item) => {
        const width = item.getBoundingClientRect().width
        const fontSize = Number.parseFloat(getComputedStyle(item).fontSize)
        return { width, ch: width / fontSize }
      }),
    )
    expect(Math.min(...textWidths.map((item) => item.ch))).toBeGreaterThan(18)
    await expect(page.getByText('REAL PROJECT EXAMPLE')).toHaveCount(1)
  })

  test('Research Record uses the desktop workspace width intentionally', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop')
    await page.goto('/worksheet')
    const geometry = await page.locator('.worksheet-field').first().evaluate((row) => {
      const helper = row.querySelector('.field-copy').getBoundingClientRect()
      const textarea = row.querySelector('textarea').getBoundingClientRect()
      return { helperWidth: helper.width, textareaWidth: textarea.width, viewport: window.innerWidth }
    })
    expect(geometry.helperWidth).toBeGreaterThan(220)
    expect(geometry.textareaWidth / geometry.helperWidth).toBeGreaterThan(1.5)
    expect(geometry.textareaWidth / geometry.viewport).toBeGreaterThan(0.42)
  })

  test('Examples preserve labels, breadth, and readable details', async ({ page }, testInfo) => {
    await page.goto('/case-studies')
    await expect(page.locator('.worked-example-heading .example-label')).toHaveCount(5)
    await expect(page.locator('.real-project-example .example-label')).toHaveCount(1)
    for (const discipline of ['Mathematics', 'Computer Science', 'Environmental Science · Biology', 'Social Science', 'Physics']) {
      await expect(page.getByText(discipline, { exact: true })).toBeVisible()
    }
    if (testInfo.project.name === 'desktop') {
      const widths = await page.locator('.worked-example li p').evaluateAll((items) =>
        items.map((item) => item.getBoundingClientRect().width),
      )
      expect(Math.min(...widths)).toBeGreaterThan(300)
    }
  })

  test('Builder empty state coaches without criticizing', async ({ page }, testInfo) => {
    await resetStorage(page)
    await page.goto('/research-question-builder')
    await expect(page.locator('.qb-status-label')).toHaveText('START HERE')
    await expect(page.locator('.qb-live-question')).toContainText('does not need to sound academic')
    await expect(page.locator('.qb-warnings')).toHaveCount(0)
    await expect(page.locator('.qb-diagnostic')).toHaveCount(0)
    await capture(page, 'r1', testInfo.project.name, 'builder-empty')
  })

  test('Builder examples select their natural Discipline Lens', async ({ page }, testInfo) => {
    await loadExample(page, 'Saturn Rings')
    await expect(page.locator('.qb-field-presets button[aria-pressed="true"]')).toHaveText('Physics')
    await capture(page, 'r1', testInfo.project.name, 'builder-saturn')

    await page.getByRole('button', { name: /Mathematics \/ Counting/ }).click()
    await expect(page.locator('.qb-field-presets button[aria-pressed="true"]')).toHaveText('Mathematics')
    await expect(page.locator('.qb-live-question')).toContainText(/recurrence|closed form|conditions/i)
    await expect(page.locator('.qb-logic .sr-only')).toContainText('Object / structure')
    await expect(page.locator('.qb-logic .sr-only')).toContainText('Assumptions / conditions')
    await expect(page.locator('.qb-logic .sr-only')).toContainText('Proof / computation / counterexample')
    await expect(page.locator('.qb-logic .sr-only')).not.toContainText('Factor / relation')
    await capture(page, 'r1', testInfo.project.name, 'builder-mathematics')
  })

  test('Association wording remains non-causal', async ({ page }, testInfo) => {
    await loadExample(page, 'Environmental Science')
    await openBuilderStage(page, 'Relationship')
    await page.getByLabel('Relationship structure').selectOption('association')
    const question = await page.locator('.qb-live-question').innerText()
    expect(question).toMatch(/associated with|related to|co-vary/i)
    expect(question).not.toMatch(/\bcauses?\b|\baffects?\b|\bleads? to\b/i)
    await capture(page, 'r1', testInfo.project.name, 'builder-association')
  })

  test('Placeholder attack cannot earn complete or Strong diagnostics', async ({ page }) => {
    await resetStorage(page)
    await page.goto('/research-question-builder')
    await page.getByLabel('Broad interest').fill('sodas')
    await openBuilderStage(page, 'Phenomenon')
    await page.getByRole('textbox', { name: 'Phenomenon', exact: true }).fill('dasdasdsdaddasdsad')
    await openBuilderStage(page, 'Relationship')
    await page.getByLabel('Relationship structure').selectOption('association')
    await page.getByLabel(/What might affect/).fill('fdfafasfafas')
    await page.getByLabel(/What could you actually observe/).fill('asdfasdfasdf')
    await page.getByLabel(/population, system/).fill('sodas')
    await page.getByLabel(/comparison or baseline/).fill('dadas')
    await openBuilderStage(page, 'Evidence')
    await page.getByRole('textbox', { name: 'Evidence source' }).fill('dasdasdsdaddasdsad')
    await page.getByLabel('Evidence access').selectOption('I already have it')
    await openBuilderStage(page, 'Scope')
    await page.getByLabel('Time available').selectOption('2–4 weeks')
    await page.getByLabel(/smallest version/).fill('fdfafasfafas')
    await page.getByLabel('Main constraint').fill('sodas')

    await expect(page.locator('.qb-overall')).not.toContainText('STRUCTURALLY COMPLETE')
    const statuses = await page.locator('.qb-diagnostic-status').allTextContents()
    expect(statuses).not.toContain('Strong')
  })

  test('Removing evidence degrades the draft', async ({ page }) => {
    await loadExample(page, 'Computer Science')
    await openBuilderStage(page, 'Evidence')
    await page.getByRole('textbox', { name: 'Evidence source' }).fill('')
    await expect(page.locator('.qb-overall')).not.toContainText('STRUCTURALLY COMPLETE')
    const evidenceRow = page.locator('.qb-diagnostic-row').filter({ hasText: 'Evidence' })
    await expect(evidenceRow).not.toContainText('Strong')
  })

  test('Builder imports, persists, and requires explicit conflict choice', async ({ page }) => {
    await resetStorage(page)
    await loadExample(page, 'Mathematics / Counting')
    await page.getByRole('button', { name: 'Add to Research Record' }).click()
    await page.goto('/worksheet')
    await expect(page.getByLabel('Interest')).toHaveValue('combinatorics')
    await expect(page.getByLabel('Direction / discipline')).toHaveValue('Mathematics')
    await page.reload()
    await expect(page.getByLabel('Phenomenon')).toHaveValue('counting restricted lattice paths')

    await page.evaluate(() => {
      const record = JSON.parse(localStorage.getItem('research-starter-worksheet'))
      record.question.current = 'Keep this existing question'
      record.literature.sources = 'Keep this source'
      localStorage.setItem('research-starter-worksheet', JSON.stringify(record))
    })
    await loadExample(page, 'Saturn Rings')
    await page.getByRole('button', { name: 'Add to Research Record' }).click()
    await expect(page.getByRole('button', { name: 'Keep existing' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Replace with builder draft' })).toBeVisible()
    await page.getByRole('button', { name: 'Keep existing' }).click()
    expect(await page.evaluate(() => JSON.parse(localStorage.getItem('research-starter-worksheet')).question.current))
      .toBe('Keep this existing question')
    expect(await page.evaluate(() => JSON.parse(localStorage.getItem('research-starter-worksheet')).literature.sources))
      .toBe('Keep this source')
  })

  test('malformed and legacy Research Record storage recover safely', async ({ page }) => {
    await page.goto('/')
    await page.evaluate(() => localStorage.setItem('research-starter-worksheet', '{bad json'))
    await page.goto('/worksheet')
    await expect(page.getByLabel('Interest')).toHaveValue('')

    await page.evaluate(() => localStorage.setItem('research-starter-worksheet', JSON.stringify({
      interest: 'legacy interest',
      field: 'Biology',
      phenomenon: 'legacy phenomenon',
      questions: 'legacy question',
    })))
    await page.reload()
    await expect(page.getByLabel('Interest')).toHaveValue('legacy interest')
    await expect(page.getByLabel('Current question')).toHaveValue('legacy question')
  })
})
