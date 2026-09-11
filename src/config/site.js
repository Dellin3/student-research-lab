export const SITE = {
  name: 'Research Starter Lab',
  origin: 'https://student-research-lab-theta.vercel.app',
  defaultTitle: 'Research Starter Lab | Start Research & Find Programs',
  defaultDescription:
    'Learn how to start a small research project and find research programs, papers, data, and people to ask.',
}

export function absoluteUrl(path = '/') {
  const pathOnly = String(path || '/').split(/[?#]/, 1)[0]
  const normalizedPath = `/${pathOnly.replace(/^\/+|\/+$/g, '')}`.replace(/\/{2,}/g, '/')

  return `${SITE.origin}${normalizedPath}`
}
