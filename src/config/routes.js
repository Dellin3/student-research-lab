export const PUBLIC_ROUTES = [
  {
    path: '/',
    title: 'How to Start Research in High School | Research Starter Lab',
    description:
      'A free step-by-step pathway for high school students to find a research topic, read scientific literature, form a testable question, use public data, contact mentors, revise their work, and create a real research output.',
    sitemap: true,
  },
  {
    path: '/start-here',
    title: 'Start Here | Research Starter Lab',
    description:
      'Understand the student research journey and complete a concrete first-day checklist.',
    navigationLabel: 'START',
    sitemap: true,
  },
  {
    path: '/learn',
    title: 'Learn Student Research Skills | Research Starter Lab',
    description:
      'Learn how to narrow a topic, review literature, use AI responsibly, build an investigation, revise, and seek mentor feedback.',
    navigationLabel: 'LEARN',
    sitemap: true,
  },
  {
    path: '/tools',
    title: 'Student Research Tools | Research Starter Lab',
    description:
      'Use free tools to narrow a research direction, shape a question, and keep a private, local Research Record.',
    navigationLabel: 'TOOLS',
    sitemap: true,
  },
  {
    path: '/topic-narrowing',
    title: 'How to Narrow a Research Topic | Topic Narrowing Lab',
    description:
      'Turn a broad interest into a bounded research direction. Use this free Topic Narrowing Lab to choose an object, a discipline-specific lens, and one inspectable boundary before writing a question.',
    sitemap: true,
  },
  {
    path: '/find-a-direction',
    title: 'Find a Direction | Research Starter Lab',
    description:
      'Narrow an interest into a concrete, researchable problem across many fields.',
    sitemap: true,
  },
  {
    path: '/research-workflow',
    title: 'Research Workflow | Research Starter Lab',
    description:
      'Learn an iterative research workflow built around tests, failures, revisions, and new questions.',
    sitemap: true,
  },
  {
    path: '/research-question-builder',
    title:
      'Free Research Question Builder for High School Students | Research Starter Lab',
    description:
      'Use a free interactive research question builder to narrow a broad interest, identify variables and evidence, check project scope, and create a focused high school research question.',
    sitemap: true,
  },
  {
    path: '/ai-literature',
    title: 'AI & Literature | Research Starter Lab',
    description:
      'Search, map, verify, and cite research literature while using AI responsibly.',
    sitemap: true,
  },
  {
    path: '/build-a-project',
    title: 'Build a Project | Research Starter Lab',
    description:
      'Formulate a question, build a toy model, analyze public data, validate results, and produce a final deliverable.',
    sitemap: true,
  },
  {
    path: '/outreach',
    title: 'Outreach | Research Starter Lab',
    description:
      'Identify suitable mentors, write specific emails, follow up professionally, and use feedback well.',
    sitemap: true,
  },
  {
    path: '/worksheet',
    title: 'Research Record | Research Starter Lab',
    description:
      'Keep a private, local Research Record of sources, questions, attempts, feedback, limitations, and next actions.',
    navigationLabel: 'RESEARCH RECORD',
    sitemap: true,
  },
  {
    path: '/case-studies',
    title: 'Case Studies | Research Starter Lab',
    description:
      'See how a student interest can develop into an evidence-based research project.',
    navigationLabel: 'EXAMPLES',
    sitemap: true,
  },
]

export const ROUTES_BY_PATH = Object.fromEntries(
  PUBLIC_ROUTES.map((route) => [route.path, route]),
)

const NAVIGATION_PATHS = ['/start-here', '/learn', '/tools', '/case-studies', '/worksheet']

export const NAVIGATION_ROUTES = NAVIGATION_PATHS.map(
  (path) => ROUTES_BY_PATH[path],
)

export function getRoute(path) {
  return ROUTES_BY_PATH[path]
}
