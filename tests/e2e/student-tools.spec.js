import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { expectHealthyLayout } from './helpers.js'

const account = JSON.parse(readFileSync(new URL('../../src/config/account.public.json', import.meta.url), 'utf8'))
const programRows = page => page.locator('.opportunity-row')

async function useClipboard(context) {
  await context.grantPermissions(['clipboard-read', 'clipboard-write'])
}
async function expectNoSeriousAxeViolations(page) {
  const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze()
  expect(result.violations.filter(({ impact }) => ['serious', 'critical'].includes(impact))).toEqual([])
}

// Signs in a test student against a mocked Supabase project. No request leaves the browser.
async function mockSignedInStudent(page) {
  const user = { id: '00000000-0000-4000-8000-000000000001', aud: 'authenticated', role: 'authenticated', email: 'student@example.com', app_metadata: { provider: 'google', providers: ['google'] }, user_metadata: {}, created_at: '2026-09-01T00:00:00Z' }
  const session = { access_token: 'test-access-token', token_type: 'bearer', expires_in: 3600, expires_at: Math.floor(Date.now() / 1000) + 3600, refresh_token: 'test-refresh-token', user }
  await page.addInitScript(([key, value]) => window.localStorage.setItem(key, value), [`sb-${account.projectId}-auth-token`, JSON.stringify(session)])
  const saves = []
  let row = null
  await page.route(`${account.url}/auth/v1/**`, route => route.fulfill({ json: route.request().url().includes('/user') ? user : session }))
  await page.route(`${account.url}/rest/v1/research_progress**`, route => route.fulfill({ json: row ? [row] : [] }))
  await page.route(`${account.url}/rest/v1/rpc/save_research_progress`, async route => {
    const body = route.request().postDataJSON()
    saves.push(body)
    row = { user_id: user.id, doc: body.p_doc, revision: (row?.revision || 0) + 1, updated_at: new Date().toISOString() }
    await route.fulfill({ json: row })
  })
  return { saves }
}

test.describe('Find a program: subjects and saved lists', () => {
  test('subject filter narrows programs and survives a reload', async ({ page }) => {
    await page.goto('/resources')
    await expect(programRows(page)).toHaveCount(15)
    await page.getByLabel('Subject').selectOption('social-humanities')
    await expect(programRows(page)).toHaveCount(3)
    await expect(page).toHaveURL(/subject=social-humanities/)
    await page.reload()
    await expect(page.getByLabel('Subject')).toHaveValue('social-humanities')
    await expect(programRows(page)).toHaveCount(3)
    await page.getByRole('button', { name: 'Clear filters' }).click()
    await expect(programRows(page)).toHaveCount(15)
  })

  test('saved programs persist, filter, and share as a link', async ({ page, context, browser }) => {
    await useClipboard(context)
    await page.goto('/resources')
    await page.getByRole('checkbox', { name: 'Save to my list: MIT PRIMES' }).check()
    await page.getByRole('checkbox', { name: 'Save to my list: CrowdMath' }).check()
    await expect(page.getByRole('checkbox', { name: 'Show only my list (2)' })).toBeVisible()
    await page.reload()
    await expect(page.getByRole('checkbox', { name: 'Save to my list: CrowdMath' })).toBeChecked()
    await page.getByRole('checkbox', { name: 'Show only my list (2)' }).check()
    await expect(page).toHaveURL(/saved=1/)
    await expect(programRows(page)).toHaveCount(2)
    await expectHealthyLayout(page)
    await page.getByRole('button', { name: 'Copy link to my list' }).click()
    await expect(page.locator('.list-notice')).toContainText('Link copied')
    const link = await page.evaluate(() => navigator.clipboard.readText())
    expect(link).toBe(new URL('/resources?programs=primes,crowdmath', page.url()).href)

    const visitor = await browser.newContext()
    const shared = await visitor.newPage()
    await shared.goto(link)
    await expect(programRows(shared)).toHaveCount(2)
    await expect(shared.locator('.shared-list-banner')).toContainText('This link shows 2 programs')
    await shared.getByRole('button', { name: 'Save these to my list' }).click()
    await expect(shared.locator('.list-notice')).toContainText('Added 2 programs to your list.')
    await expect(shared.getByRole('checkbox', { name: 'Show only my list (2)' })).toBeVisible()
    await shared.getByRole('button', { name: 'Show all programs' }).click()
    await expect(programRows(shared)).toHaveCount(15)
    await visitor.close()
  })

  test('an empty saved list explains how to add programs', async ({ page }) => {
    await page.goto('/resources?saved=1')
    await expect(page.getByRole('heading', { name: 'Your list is empty.' })).toBeVisible()
    await page.getByRole('button', { name: 'Show all programs' }).click()
    await expect(programRows(page)).toHaveCount(15)
  })

  test('grouped research websites link out with descriptive names', async ({ page }) => {
    await page.goto('/resources#sources')
    for (const name of ['Find papers', 'Find evidence to examine', 'Help with a real project', 'Keep and cite sources']) {
      await expect(page.getByRole('heading', { name })).toBeVisible()
    }
    const arxiv = page.getByRole('link', { name: /Browse preprints: arXiv/ })
    await expect(arxiv).toHaveAttribute('href', 'https://arxiv.org/')
    await expect(arxiv).toHaveAttribute('target', '_blank')
  })
})

test.describe('Start on your own: worked examples', () => {
  test('students can switch subjects and share an example link', async ({ page }) => {
    await page.goto('/start-here')
    await expect(page.getByRole('radio', { name: 'Environment' })).toBeChecked()
    await page.getByRole('radio', { name: 'Mathematics' }).check()
    await expect(page.locator('#example')).toContainText('Why is the sum of the first n odd numbers equal to n²?')
    await expect(page).toHaveURL(/example=mathematics/)
    await expect(page.locator('.example-walk > li')).toHaveCount(4)
    await page.goto('/start-here?example=humanities')
    await expect(page.getByRole('radio', { name: 'Humanities' })).toBeChecked()
    await expect(page.locator('#example')).toBeInViewport()
    await expectHealthyLayout(page)
  })
})

test.describe('Guides and small fixes', () => {
  test('guide note templates copy to the clipboard', async ({ page, context }) => {
    await useClipboard(context)
    await page.goto('/guides/read-your-first-paper')
    await page.getByRole('button', { name: 'Copy this note template' }).click()
    await expect(page.locator('.copy-template-status')).toContainText('Copied')
    expect(await page.evaluate(() => navigator.clipboard.readText())).toMatch(/^Source:[\s\S]*Next step:/)
    await page.goto('/guides/research-without-a-mentor')
    await page.getByRole('button', { name: 'Copy a feedback note template' }).click()
    expect(await page.evaluate(() => navigator.clipboard.readText())).toContain('Where I am stuck:')
  })

  test('feedback leads back to the page it came from', async ({ page }) => {
    await page.goto('/feedback?from=/resources')
    await page.getByRole('link', { name: 'Back' }).click()
    await expect(page).toHaveURL(/\/resources$/)
  })

  test('the homepage introduction keeps a space between its sentences', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('.home-introduction')).toHaveText(/own\.\s+Or find/)
  })
})

test.describe('My research tools (mocked account)', () => {
  test('counters, source links, dated entries, copying, and Ctrl+S saving', async ({ page, context }) => {
    await useClipboard(context)
    const { saves } = await mockSignedInStudent(page)
    await page.goto('/my-research')
    await expect(page.locator('.save-state')).toHaveText('Ready for your first note')

    const question = page.getByLabel('My research question')
    await expect(page.locator('#count-question')).toHaveText('0 / 2,000 characters')
    await question.fill('Are shaded surfaces cooler?')
    await expect(page.locator('#count-question')).toHaveText('27 / 2,000 characters')

    await page.getByLabel('Sources & links').fill('Overview: https://www.example.org/heat-study. Reading guide doi:10.1371/journal.pcbi.1008032.')
    await expect(page.getByRole('link', { name: /example\.org\/heat-study/ })).toHaveAttribute('href', 'https://www.example.org/heat-study')
    await expect(page.getByRole('link', { name: /doi:10\.1371\/journal\.pcbi\.1008032/ })).toHaveAttribute('href', 'https://doi.org/10.1371/journal.pcbi.1008032')

    await page.getByRole('button', { name: 'Add today’s entry' }).click()
    const today = await page.evaluate(() => { const d = new Date(); return [d.getFullYear(), String(d.getMonth() + 1).padStart(2, '0'), String(d.getDate()).padStart(2, '0')].join('-') })
    const progress = page.getByLabel('Progress so far')
    await expect(progress).toHaveValue(`${today}\n`)
    await expect(progress).toBeFocused()
    await page.keyboard.type('Measured two surfaces.')

    await page.keyboard.press('Control+s')
    await expect(page.locator('.save-state')).toContainText('Saved to your account')
    expect(saves.at(-1).p_doc.progress).toBe(`${today}\nMeasured two surfaces.`)

    await page.getByRole('button', { name: 'Copy all text' }).click()
    await expect(page.locator('.research-notice')).toContainText('Copied all four fields')
    expect(await page.evaluate(() => navigator.clipboard.readText())).toContain('My research question\nAre shaded surfaces cooler?')
    await expectHealthyLayout(page)
    await expectNoSeriousAxeViolations(page)
  })

  test('a paste that does not fit is reported', async ({ page, context }) => {
    await useClipboard(context)
    await mockSignedInStudent(page)
    await page.goto('/my-research')
    await expect(page.locator('.save-state')).toHaveText('Ready for your first note')
    await page.evaluate(() => navigator.clipboard.writeText('x'.repeat(2100)))
    await page.getByLabel('My research question').focus()
    await page.keyboard.press('Control+v')
    await expect(page.getByLabel('My research question')).toHaveValue('x'.repeat(2000))
    await expect(page.locator('.research-note-field.is-full .field-warning')).toContainText('did not fit')
    await expect(page.locator('#count-question')).toHaveText('2,000 / 2,000 characters · limit reached')
  })
})

test.describe('accessibility of new states', () => {
  for (const route of ['/resources?saved=1', '/resources?programs=rsi,crowdmath', '/resources?subject=sciences', '/start-here?example=mathematics', '/guides/read-your-first-paper', '/guides/research-without-a-mentor']) {
    test(`${route} has no serious or critical axe violations`, async ({ page }) => {
      await page.goto(route)
      await expect(page.locator('h1')).toBeVisible()
      await expectNoSeriousAxeViolations(page)
    })
  }
})
