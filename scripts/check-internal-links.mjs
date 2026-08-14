import { readdirSync, readFileSync, statSync } from 'node:fs'
import { dirname, extname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { PUBLIC_ROUTES } from '../src/config/routes.js'
import { SITE } from '../src/config/site.js'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const routePaths = new Set(PUBLIC_ROUTES.map((route) => route.path))
const errors = []

function filesUnder(directory) {
  return readdirSync(directory).flatMap((entry) => {
    const path = join(directory, entry)
    return statSync(path).isDirectory() ? filesUnder(path) : [path]
  })
}

for (const file of filesUnder(join(root, 'src')).filter((path) =>
  ['.js', '.jsx'].includes(extname(path)))) {
  const source = readFileSync(file, 'utf8')
  const links = [
    ...source.matchAll(/\b(?:to|href)=["'](\/[^"'?#]*)(?:[?#][^"']*)?["']/g),
  ].map((match) => match[1].replace(/\/+$/, '') || '/')

  for (const path of links) {
    if (!routePaths.has(path) && !path.startsWith('/assets/')) {
      errors.push(`${relative(root, file)} links to unconfigured route ${path}.`)
    }
  }

  const hostMatches = [...source.matchAll(/https:\/\/[^"'`\s)]+/g)].map((match) => match[0])
  for (const url of hostMatches) {
    if (url.includes('student-research-lab') && !url.startsWith(SITE.origin)) {
      errors.push(`${relative(root, file)} contains old production hostname ${url}.`)
    }
  }
}

if (errors.length) {
  console.error('Internal-link validation failed:')
  errors.forEach((error) => console.error(`- ${error}`))
  process.exitCode = 1
} else {
  console.log(`Internal-link validation passed for ${routePaths.size} configured routes.`)
}
