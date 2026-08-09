export const PUBLIC_ROUTES = [
  {
    path: '/',
    title: 'How to Start Research in High School | Research Starter Lab',
    description:
      'A free step-by-step pathway for high school students to find a research topic, read scientific literature, form a testable question, use public data, contact mentors, revise their work, and create a real research output.',
    navigationLabel: 'Home',
    sitemap: true,
  },
  {
    path: '/start-here',
    title: 'Start Here | Research Starter Lab',
    description:
      'Understand the student research journey and complete a concrete first-day checklist.',
    navigationLabel: 'Start Here',
    sitemap: true,
  },
  {
    path: '/find-a-direction',
    title: 'Find a Direction | Research Starter Lab',
    description:
      'Narrow an interest into a concrete, researchable problem across many fields.',
    navigationLabel: 'Find a Direction',
    sitemap: true,
  },
  {
    path: '/research-workflow',
    title: 'Research Workflow | Research Starter Lab',
    description:
      'Learn an iterative research workflow built around tests, failures, revisions, and new questions.',
    navigationLabel: 'Research Workflow',
    sitemap: true,
  },
  {
    path: '/ai-literature',
    title: 'AI & Literature | Research Starter Lab',
    description:
      'Search, map, verify, and cite research literature while using AI responsibly.',
    navigationLabel: 'AI & Literature',
    sitemap: true,
  },
  {
    path: '/build-a-project',
    title: 'Build a Project | Research Starter Lab',
    description:
      'Formulate a question, build a toy model, analyze public data, validate results, and produce a final deliverable.',
    navigationLabel: 'Build a Project',
    sitemap: true,
  },
  {
    path: '/outreach',
    title: 'Outreach | Research Starter Lab',
    description:
      'Identify suitable mentors, write specific emails, follow up professionally, and use feedback well.',
    navigationLabel: 'Outreach',
    sitemap: true,
  },
  {
    path: '/worksheet',
    title: 'Worksheet | Research Starter Lab',
    description:
      'An interactive and printable worksheet for planning and documenting a student research project.',
    navigationLabel: 'Worksheet',
    sitemap: true,
  },
  {
    path: '/case-studies',
    title: 'Case Studies | Research Starter Lab',
    description:
      'See how a student interest can develop into an evidence-based research project.',
    navigationLabel: 'Case Studies',
    sitemap: true,
  },
]

export const ROUTES_BY_PATH = Object.fromEntries(
  PUBLIC_ROUTES.map((route) => [route.path, route]),
)

export const NAVIGATION_ROUTES = PUBLIC_ROUTES.filter(
  (route) => route.navigationLabel,
)

export function getRoute(path) {
  return ROUTES_BY_PATH[path]
}
