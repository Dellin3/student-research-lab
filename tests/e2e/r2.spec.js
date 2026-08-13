import { expect, test } from '@playwright/test'
import { capture, expectHealthyLayout } from './helpers.js'

async function resetStorage(page) {
  await page.goto('/')
  await page.evaluate(() => window.localStorage.clear())
}

async function openStage(page, name) {
  await page.locator('.tn-progress-step').filter({ hasText: name }).click()
}

async function completePath(page, { discipline, interest, object, lens, boundary }) {
  await page.goto('/topic-narrowing')
  await page.getByRole('button', { name: discipline, exact: true }).click()
  await page.getByRole('textbox', { name: 'Interest' }).fill(interest)
  await openStage(page, 'Object')
  await page.getByRole('textbox', { name: 'Object / phenomenon' }).fill(object)
  await openStage(page, 'Lens')
  await page.getByRole('radio', { name: new RegExp(`^${lens}`, 'i') }).click()
  await openStage(page, 'Boundary')
  await page.getByRole('textbox', { name: 'Boundary' }).fill(boundary)
  await openStage(page, 'First direction')
  await page.locator('.tn-direction-list input[type="radio"]').first().click()
}

test.describe('R2 Topic Narrowing Lab', () => {
  for (const route of ['/topic-narrowing', '/tools', '/find-a-direction']) {
    test(`${route} has healthy layout`, async ({ page }, testInfo) => {
      await page.goto(route)
      await expectHealthyLayout(page)
      await capture(page, 'r2', testInfo.project.name, route.slice(1))
    })
  }

  test('homepage interest state leads to Topic Narrowing Lab', async ({ page }) => {
    await page.goto('/')
    await page.getByLabel('I have an interest, but no direction').check()
    await expect(page.getByRole('link', { name: 'Narrow a direction' })).toHaveAttribute('href', '/topic-narrowing')
  })

  test('empty state coaches without criticizing', async ({ page }, testInfo) => {
    await resetStorage(page)
    await page.goto('/topic-narrowing')
    await expect(page.getByRole('status').first()).toContainText(/pulling your attention|enough to begin/i)
    await expect(page.getByText(/too broad|invalid scope/i)).toHaveCount(0)
    await expect(page.locator('.tn-levels')).toContainText('Interest')
    await expect(page.locator('.tn-levels')).toContainText('Direction')
    await expect(page.locator('.tn-levels')).toContainText('Question')
    await capture(page, 'r2', testInfo.project.name, 'topic-narrowing-empty')
  })

  test('Mathematics path uses mathematical lenses and directions', async ({ page }, testInfo) => {
    await completePath(page, {
      discipline: 'Mathematics',
      interest: 'graph theory',
      object: 'triangle-free graphs',
      lens: 'Extremal case',
      boundary: 'graphs with a fixed maximum degree',
    })
    await expect(page.locator('.tn-direction-list label.is-selected strong')).toContainText(/extremal/i)
    await capture(page, 'r2', testInfo.project.name, 'topic-narrowing-mathematics')
    await openStage(page, 'Lens')
    await expect(page.locator('.tn-lens-grid')).toContainText('Counterexample')
    await expect(page.locator('.tn-lens-grid')).not.toContainText('Measurement')
  })

  test('Computer Science path uses CS-specific lenses', async ({ page }) => {
    await completePath(page, {
      discipline: 'Computer Science',
      interest: 'image compression',
      object: 'compressed images fed to a small classifier',
      lens: 'Robustness',
      boundary: 'one public image benchmark',
    })
    await expect(page.locator('.tn-direction-list label.is-selected')).toContainText(/robustness|benchmark|classifier/i)
  })

  test('Biology path uses a measurement lens', async ({ page }) => {
    await completePath(page, {
      discipline: 'Biology',
      interest: 'antibiotic exposure',
      object: 'bacterial growth after a short antibiotic pulse',
      lens: 'Measurement',
      boundary: 'one laboratory strain under controlled culture conditions',
    })
    await expect(page.locator('.tn-direction-list label.is-selected')).toContainText(/Measure|bacterial growth/i)
  })

  test('Social Science path uses operationalization', async ({ page }) => {
    await completePath(page, {
      discipline: 'Social Science',
      interest: 'school stress',
      object: 'reported stress after the morning commute',
      lens: 'Operationalization',
      boundary: 'students at one school during a two-week window',
    })
    await expect(page.locator('.tn-direction-list label.is-selected')).toContainText(/Operationalize|stress/i)
  })

  test('Save direction to Research Record and persist', async ({ page }) => {
    await resetStorage(page)
    await completePath(page, {
      discipline: 'Environmental Science',
      interest: 'urban heat',
      object: 'afternoon surface temperature over different surface materials',
      lens: 'Comparison',
      boundary: 'one neighborhood using publicly available measurements',
    })
    await page.getByRole('button', { name: 'Save direction to Research Record' }).click()
    await page.goto('/worksheet')
    await expect(page.getByLabel('Interest')).toHaveValue('urban heat')
    await expect(page.getByLabel('Phenomenon')).toHaveValue(/surface temperature/)
    await page.reload()
    await expect(page.getByLabel('Direction / discipline')).not.toHaveValue('')
  })

  test('Continue to Question Builder transfers context without inventing a question', async ({ page }) => {
    await resetStorage(page)
    await completePath(page, {
      discipline: 'Mathematics',
      interest: 'combinatorics',
      object: 'restricted lattice paths',
      lens: 'Structure',
      boundary: 'paths of length n on a bounded grid',
    })
    await page.getByRole('button', { name: 'Continue to Question Builder' }).click()
    await expect(page).toHaveURL(/research-question-builder/)
    await expect(page.getByText(/transferred from Topic Narrowing Lab/i)).toBeVisible()
    await expect(page.locator('.qb-field-presets button[aria-pressed="true"]')).toHaveText('Mathematics')
    await page.locator('.qb-progress-step').filter({ hasText: 'Interest' }).click()
    await expect(page.getByLabel('Broad interest')).toHaveValue('combinatorics')
    await expect(page.locator('.qb-status-label')).not.toHaveText('STRUCTURALLY COMPLETE')
  })

  test('existing Research Record is not silently overwritten', async ({ page }) => {
    await resetStorage(page)
    await page.goto('/worksheet')
    await page.getByLabel('Interest').fill('keep this interest')
    await page.getByRole('button', { name: 'Save' }).first().click()
    await completePath(page, {
      discipline: 'Physics',
      interest: 'fluid behavior',
      object: 'oscillation of a wake behind a simple obstacle',
      lens: 'Parameter',
      boundary: 'one flow setting in a simulated channel',
    })
    await page.getByRole('button', { name: 'Save direction to Research Record' }).click()
    await expect(page.getByRole('button', { name: 'Keep existing' })).toBeVisible()
    await page.getByRole('button', { name: 'Keep existing' }).click()
    expect(await page.evaluate(() => JSON.parse(localStorage.getItem('research-starter-worksheet')).startingPoint.interest))
      .toBe('keep this interest')
  })

  test('Tools hub presents the working sequence', async ({ page }) => {
    await page.goto('/tools')
    const titles = await page.locator('.tool-sequence h2').allTextContents()
    expect(titles[0]).toMatch(/Topic Narrowing/)
    expect(titles[1]).toMatch(/Question Builder/)
    expect(titles[2]).toMatch(/Research Record/)
  })

  test('Find a Direction invites the lab without duplicating it', async ({ page }) => {
    await page.goto('/find-a-direction')
    await expect(page.getByRole('link', { name: 'Try Topic Narrowing Lab' })).toBeVisible()
    await expect(page.locator('.tn-lab')).toHaveCount(0)
  })
})
