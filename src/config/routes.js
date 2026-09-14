export const PUBLIC_ROUTES = [
  { path: '/', title: 'Start Research & Find Research Programs | Research Starter Lab', description: 'A simple starting point for high-school research: learn how to begin independently and find research programs, papers, and data.', sitemap: true },
  { path: '/start-here', title: 'How to Start Your Own Research | Research Starter Lab', description: 'Four practical steps to begin a small research project, with a worked example and direct links to papers and data.', navigationLabel: 'Start on your own', sitemap: true },
  { path: '/resources', title: 'High-School Research Programs & Resources | Research Starter Lab', description: 'Find research programs with international, U.S. school, and citizenship requirements, plus direct links to papers, data, and researcher directories.', navigationLabel: 'Find a program', sitemap: true },
  { path: '/worksheet', title: 'Download Previous Notes | Research Starter Lab', description: 'Download research notes and tool drafts previously saved in this browser.', sitemap: false, prerender: true, noindex: true },
  { path: '/account', title: 'Sign In | Research Starter Lab', description: 'Sign in to save and continue your research.', sitemap: false, prerender: true, noindex: true },
  { path: '/my-research', title: 'My Research | Research Starter Lab', description: 'Your research question, progress, sources, and next step.', sitemap: false, prerender: true, noindex: true },
]
export const LEGACY_REDIRECTS = {
  '/learn': '/start-here', '/tools': '/start-here', '/topic-narrowing': '/start-here',
  '/find-a-direction': '/start-here', '/research-workflow': '/start-here',
  '/research-question-builder': '/start-here', '/investigation-planner': '/start-here',
  '/ai-literature': '/resources#sources', '/build-a-project': '/start-here',
  '/outreach': '/resources#mentors', '/case-studies': '/start-here#example',
}
export const ROUTES_BY_PATH = Object.fromEntries(PUBLIC_ROUTES.map(route => [route.path, route]))
export const NAVIGATION_ROUTES = ['/start-here', '/resources'].map(path => ROUTES_BY_PATH[path])
export function getRoute(path) { return ROUTES_BY_PATH[path] }
