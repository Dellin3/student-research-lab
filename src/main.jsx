import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'

const rootElement = document.getElementById('root')

document.head
  .querySelectorAll('[data-seo-fallback="true"]')
  .forEach((element) => element.remove())

// Filters and example choices are controlled inputs that read the URL. Applying
// router updates synchronously keeps a clicked option from briefly reverting.
const application = (
  <StrictMode>
    <HelmetProvider>
      <BrowserRouter useTransitions={false}>
        <App />
      </BrowserRouter>
    </HelmetProvider>
  </StrictMode>
)

// Static exports contain the unfiltered page. A shared query URL must render its
// selected view directly rather than hydrate against different static markup.
const hasQueryView = ['/start-here', '/resources'].includes(window.location.pathname.replace(/\/+$/, ''))
  && window.location.search.length > 1

if (rootElement.hasChildNodes() && !hasQueryView) {
  hydrateRoot(rootElement, application)
} else {
  createRoot(rootElement).render(application)
}
