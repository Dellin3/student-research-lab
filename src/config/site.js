export const SITE = {
  name: 'Research Starter Lab',
  origin: 'https://student-research-lab-theta.vercel.app',
  defaultTitle: 'Research Starter Lab | A Student Research Pathway',
  defaultDescription:
    'A practical pathway that helps high school students move from curiosity to literature, questions, models, data, mentorship, revision, and a meaningful research output.',
}

export function absoluteUrl(path = '/') {
  const pathOnly = String(path || '/').split(/[?#]/, 1)[0]
  const normalizedPath = `/${pathOnly.replace(/^\/+|\/+$/g, '')}`.replace(/\/{2,}/g, '/')

  return `${SITE.origin}${normalizedPath}`
}
