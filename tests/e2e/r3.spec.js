import { expect, test } from '@playwright/test'
import { capture, expectHealthyLayout, openRecordDetail } from './helpers.js'

async function resetStorage(page) {
  await page.goto('/')
  await page.evaluate(() => localStorage.clear())
}

async function openPlannerStep(page, name) {
  await page.locator('.ip-progress button').filter({ hasText: name }).click()
}

async function startPlanner(page, modeLabel, question = 'How does one bounded condition change the observable result?') {
  await page.goto('/investigation-planner')
  await page.getByLabel('Research question').fill(question)
  await openPlannerStep(page, 'Mode')
  await page.getByRole('radio', { name: new RegExp(modeLabel, 'i') }).check()
}

async function fillPlanner(page, modeLabel, values = {}) {
  await startPlanner(page, modeLabel, values.question)
  for (const [step, value] of [
    ['Evidence', values.evidence || 'A documented result and comparison that another person can inspect.'],
    ['Smallest test', values.smallest || 'Inspect one bounded case with a documented procedure.'],
    ['Challenge', values.challenge || 'A failed comparison or alternative explanation would require revision.'],
  ]) {
    await openPlannerStep(page, step)
    await page.locator('.ip-main textarea').first().fill(value)
  }
  await openPlannerStep(page, 'Limits')
  await page.getByLabel('Practical constraints').fill(values.constraints || 'Four weeks and only local or public resources.')
  await page.getByLabel('Known limitation').fill(values.limitation || 'This first case cannot establish a general conclusion.')
  await openPlannerStep(page, 'First action')
  await page.getByLabel('First action').fill(values.action || 'Document the input and run one bounded comparison.')
  await page.getByRole('checkbox', { name: /completed a human review/i }).check()
}

test.describe('R3 Investigation Planner', () => {
  test('empty state coaches progressively', async ({ page }, testInfo) => {
    await resetStorage(page)
    await page.goto('/investigation-planner')
    await expect(page.locator('.ip-status')).toHaveText('START HERE')
    await expect(page.getByText(/No usable question was found/)).toBeVisible()
    await expect(page.getByText(/Missing question|Missing evidence|Missing method/i)).toHaveCount(0)
    await expectHealthyLayout(page)
    await capture(page, 'r3', testInfo.project.name, 'planner-empty')
  })

  test('mathematics path uses proof and counterexample language without experiment fields', async ({ page }) => {
    await startPlanner(page, 'Mathematical', 'Under what conditions is this graph invariant preserved?')
    await openPlannerStep(page, 'Evidence')
    await expect(page.locator('.ip-main')).toContainText(/definitions|lemmas|small cases|counterexamples/i)
    await openPlannerStep(page, 'Challenge')
    await expect(page.locator('.ip-main textarea')).toHaveAttribute('placeholder', /counterexample|failed implication/i)
    await expect(page.getByText(/dependent variable|control group/i)).toHaveCount(0)
  })

  for (const [label, expected] of [
    ['Experimental', /measurements|changing one condition|baseline/i],
    ['Observational', /records|observations|without assigning a treatment|confounder/i],
    ['Computational', /dataset|metric|benchmark/i],
    ['Model / simulation', /model outputs|parameter|comparison targets/i],
  ]) {
    test(`${label} mode provides appropriate evidence language`, async ({ page }) => {
      await startPlanner(page, label)
      await openPlannerStep(page, 'Evidence')
      await expect(page.locator('.ip-main')).toContainText(expected)
    })
  }

  test('gibberish cannot earn structural completion', async ({ page }) => {
    await fillPlanner(page, 'Computational', {
      question: 'asdfasdfasdf',
      evidence: 'asdfasdfasdf',
      smallest: 'asdfasdfasdf',
      challenge: 'asdfasdfasdf',
      constraints: 'asdfasdfasdf',
      limitation: 'asdfasdfasdf',
      action: 'asdfasdfasdf',
    })
    await expect(page.locator('.ip-status')).not.toHaveText('STRUCTURALLY COMPLETE')
  })

  test('Question Builder draft transfers explicitly into planner', async ({ page }) => {
    await resetStorage(page)
    await page.goto('/research-question-builder')
    await page.locator('.tool-options > summary').click()
    await page.getByRole('button', { name: /Mathematics \/ Counting/ }).click()
    await page.getByRole('link', { name: 'Continue to Investigation Planner' }).click()
    await expect(page).toHaveURL(/investigation-planner/)
    await expect(page.getByRole('button', { name: /Question Builder draft/ })).toBeVisible()
    await page.getByRole('button', { name: /Question Builder draft/ }).click()
    await expect(page.getByLabel('Research question')).not.toHaveValue('')
  })

  test('planner saves to record, persists, and does not silently replace conflict', async ({ page }) => {
    await resetStorage(page)
    await page.goto('/worksheet')
    await page.getByLabel('My question').fill('Keep this existing question')
    await page.getByRole('button', { name: 'Save now', exact: true }).first().click()
    await fillPlanner(page, 'Observational', { question: 'How is canopy associated with afternoon temperature?' })
    await page.getByRole('button', { name: 'Save to Research Record' }).click()
    await expect(page.getByText(/different current question/)).toBeVisible()
    await page.getByRole('button', { name: 'Keep record unchanged' }).click()
    expect(await page.evaluate(() => JSON.parse(localStorage.getItem('research-starter-worksheet')).question.current))
      .toBe('Keep this existing question')

    await page.getByRole('button', { name: 'Save to Research Record' }).click()
    await page.getByRole('button', { name: 'Replace mapped record fields' }).click()
    await page.goto('/worksheet')
    await expect(page.getByLabel('My question')).toHaveValue(/canopy associated/)
    await expect(page.getByLabel('Smallest investigation')).not.toHaveValue('')
    await page.reload()
    await expect(page.getByLabel('My question')).toHaveValue(/canopy associated/)
  })
})

test.describe('R3 Research Record', () => {
  test('source, evidence, and revision logs persist and remain distinct', async ({ page }) => {
    await resetStorage(page)
    await page.goto('/worksheet')
    await openRecordDetail(page, 'Source log')
    await page.getByRole('button', { name: 'Add source' }).click()
    await page.getByLabel('Title').fill('<script>alert(1)</script>')
    await page.getByLabel('URL').fill('javascript:alert(1)')
    await page.getByLabel(/inspected the original source/i).check()
    await openRecordDetail(page, 'Evidence log')
    await page.getByRole('button', { name: 'Add evidence' }).click()
    await page.getByRole('textbox', { name: 'Finding', exact: true }).fill('The bounded calculation produced a counterexample.')
    await page.locator('.worksheet-section:not(.notebook-extra)').filter({ hasText: 'Evidence log' }).locator('select').selectOption('challenge')
    await openRecordDetail(page, 'Revision history')
    await page.getByRole('button', { name: 'Add revision history' }).click()
    await page.getByRole('textbox', { name: 'What changed', exact: true }).fill('Question revised')
    await page.getByRole('button', { name: 'Save now', exact: true }).first().click()
    await page.reload()
    await openRecordDetail(page, 'Source log')
    await expect(page.getByLabel('Title')).toHaveValue('<script>alert(1)</script>')
    expect((await page.locator('script').allTextContents()).some((text) => text.includes('alert(1)'))).toBe(false)
    await openRecordDetail(page, 'Evidence log')
    await expect(page.locator('.worksheet-section:not(.notebook-extra)').filter({ hasText: 'Evidence log' }).locator('select')).toHaveValue('challenge')
  })

  test('exports versioned JSON and useful Markdown', async ({ page }) => {
    await resetStorage(page)
    await page.goto('/worksheet')
    await page.getByLabel('My question').fill('What result should this investigation inspect?')
    const [jsonDownload] = await Promise.all([
      page.waitForEvent('download'),
      page.getByRole('button', { name: 'Download a backup' }).click(),
    ])
    expect(jsonDownload.suggestedFilename()).toMatch(/research-record.*\.json/)
    const [markdownDownload] = await Promise.all([
      page.waitForEvent('download'),
      page.getByRole('button', { name: 'Export text' }).click(),
    ])
    expect(markdownDownload.suggestedFilename()).toMatch(/research-record.*\.md/)
  })

  test('safe import rejects malformed data and requires an explicit mode and confirmation', async ({ page }) => {
    await resetStorage(page)
    await page.goto('/worksheet')
    await page.getByLabel('My question').fill('Preserve this question')
    await page.getByText('Import a backup', { exact: true }).click()
    await page.locator('input[type=file]').setInputFiles({
      name: 'bad.json',
      mimeType: 'application/json',
      buffer: Buffer.from('{bad json'),
    })
    await expect(page.getByText(/Choose merge or replace/)).toBeVisible()
    await page.getByLabel(/Replace the current/).check()
    page.once('dialog', (dialog) => dialog.accept())
    await page.locator('input[type=file]').setInputFiles({
      name: 'wrong.json',
      mimeType: 'application/json',
      buffer: Buffer.from('{"version":3,"wrong":true}'),
    })
    await expect(page.getByText(/Import failed/)).toBeVisible()
    await expect(page.getByLabel('My question')).toHaveValue('Preserve this question')
  })

  test('mentor brief populates, remains editable, and copies locally', async ({ page, context }) => {
    await resetStorage(page)
    await context.grantPermissions(['clipboard-read', 'clipboard-write'])
    await page.goto('/worksheet')
    await page.getByLabel('My question').fill('Which comparison should I run first?')
    await page.getByText('Mentor brief', { exact: true }).click()
    await page.getByRole('button', { name: 'Generate from current record' }).click()
    const brief = page.getByLabel('Editable mentor brief')
    await expect(brief).toHaveValue(/Which comparison should I run first\?/)
    await brief.fill('Edited local mentor brief')
    await page.getByRole('button', { name: 'Copy brief' }).click()
    await expect(page.getByText('Mentor brief copied')).toBeVisible()
  })
})
