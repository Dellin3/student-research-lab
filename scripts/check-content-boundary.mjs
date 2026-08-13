import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const root = new URL('..', import.meta.url).pathname
const errors = []
const homePage = readFileSync(join(root, 'src/components/home/HomePage.jsx'), 'utf8')

if (/SaturnCasePreview/.test(homePage)) {
  errors.push('Homepage still imports the dedicated SaturnCasePreview component.')
}

const generalFiles = [
  'src/components/home/HomePage.jsx',
  'src/pages/StartHerePage.jsx',
  'src/pages/FindDirectionPage.jsx',
  'src/pages/WorkflowPage.jsx',
  'src/pages/AiLiteraturePage.jsx',
  'src/pages/BuildProjectPage.jsx',
  'src/pages/OutreachPage.jsx',
]

const primesSpecificTerms = [
  /stationary[- ]phase/i,
  /branch diagnostics?/i,
  /radio[- ]occultation inversion/i,
]

for (const relativePath of generalFiles) {
  const path = join(root, relativePath)
  if (!existsSync(path)) continue
  const content = readFileSync(path, 'utf8')
  for (const pattern of primesSpecificTerms) {
    if (pattern.test(content)) {
      errors.push(`${relativePath} contains detailed PRIMES-specific terminology (${pattern}).`)
    }
  }
}

if (errors.length) {
  console.error('Content-boundary validation failed:')
  errors.forEach((error) => console.error(`- ${error}`))
  process.exitCode = 1
} else {
  console.log('Content-boundary validation passed: Saturn remains an example, not the product identity.')
}
