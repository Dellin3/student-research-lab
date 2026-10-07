import { loadEnv } from 'vite'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../', import.meta.url))
for (const [key, value] of Object.entries(loadEnv('production', root, 'VITE_'))) {
  if (process.env[key] === undefined) process.env[key] = value
}

export const { SITE, DEFAULT_SITE_ORIGIN, absoluteUrl, normalizeSiteOrigin } = await import('../src/config/site.js')
