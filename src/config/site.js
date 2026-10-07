export const DEFAULT_SITE_ORIGIN = 'https://student-research-lab-theta.vercel.app'

export function normalizeSiteOrigin(value) {
  const url = new URL(value)
  if (url.protocol !== 'https:' || url.username || url.password || url.pathname !== '/' || url.search || url.hash) {
    throw new Error('VITE_PUBLIC_SITE_URL must be an HTTPS origin without a path, credentials, query, or fragment.')
  }
  return url.origin
}

const configuredOrigin = import.meta.env?.VITE_PUBLIC_SITE_URL || globalThis.process?.env?.VITE_PUBLIC_SITE_URL || DEFAULT_SITE_ORIGIN

export const SITE = {
  name: 'Research Starter Lab',
  origin: normalizeSiteOrigin(configuredOrigin),
  defaultTitle: 'Research Starter Lab | Start Research & Find Programs',
  defaultDescription:
    'Learn how to start a small research project and find research programs, papers, data, and people to ask.',
}

export function absoluteUrl(path = '/') {
  const pathOnly = String(path || '/').split(/[?#]/, 1)[0]
  const normalizedPath = `/${pathOnly.replace(/^\/+|\/+$/g, '')}`.replace(/\/{2,}/g, '/')

  return `${SITE.origin}${normalizedPath}`
}
