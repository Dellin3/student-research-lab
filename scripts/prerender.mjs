import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createServer } from 'vite'
import { PUBLIC_ROUTES } from '../src/config/routes.js'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const distDirectory = join(root, 'dist')
const template = readFileSync(join(distDirectory, 'index.html'), 'utf8')
const routes = PUBLIC_ROUTES.filter((route) => route.sitemap || route.prerender)

function removeFallbackMetadata(html) {
  return html
    .replace(
      /<(title|script)\b[^>]*data-seo-fallback="true"[^>]*>[\s\S]*?<\/\1>\s*/g,
      '',
    )
    .replace(
      /<(meta|link)\b[^>]*data-seo-fallback="true"[^>]*\/?>\s*/g,
      '',
    )
}

function outputPath(pathname) {
  if (pathname === '/') {
    return join(distDirectory, 'index.html')
  }

  return join(distDirectory, pathname.replace(/^\/+|\/+$/g, ''), 'index.html')
}

process.env.NODE_ENV = 'production'

const vite = await createServer({
  appType: 'custom',
  logLevel: 'silent',
  server: { middlewareMode: true },
})

try {
  const { render } = await vite.ssrLoadModule('/src/entry-server.jsx')

  for (const route of routes) {
    const { appHtml, headHtml } = render(route.path)
    const html = removeFallbackMetadata(template)
      .replace('</head>', `    ${headHtml}\n  </head>`)
      .replace('<div id="root"></div>', `<div id="root">${appHtml}</div>`)
    const destination = outputPath(route.path)

    mkdirSync(dirname(destination), { recursive: true })
    writeFileSync(destination, html)
    console.log(`Prerendered ${route.path} -> ${destination.replace(`${root}/`, '')}`)
  }
} finally {
  await vite.close()
}
