import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { discoveryFiles } from './discovery-content.mjs'

for (const [name, content] of Object.entries(discoveryFiles())) {
  writeFileSync(fileURLToPath(new URL(`../public/${name}`, import.meta.url)), content)
}
console.log('Generated robots, sitemaps, and llms.txt from the canonical origin and public routes.')
