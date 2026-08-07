import { StrictMode } from 'react'
import { renderToString } from 'react-dom/server'
import { HelmetProvider } from 'react-helmet-async'
import { StaticRouter } from 'react-router-dom'
import App from './App.jsx'

const ROOT_MARKER = '<div data-prerender-root="true">'

export function render(url) {
  const rendered = renderToString(
    <StrictMode>
      <HelmetProvider>
        <StaticRouter location={url}>
          <div data-prerender-root="true">
            <App />
          </div>
        </StaticRouter>
      </HelmetProvider>
    </StrictMode>,
  )
  const rootStart = rendered.indexOf(ROOT_MARKER)

  if (rootStart === -1 || !rendered.endsWith('</div>')) {
    throw new Error(`Unable to separate document metadata for ${url}.`)
  }

  return {
    headHtml: rendered.slice(0, rootStart),
    appHtml: rendered.slice(rootStart + ROOT_MARKER.length, -'</div>'.length),
  }
}
