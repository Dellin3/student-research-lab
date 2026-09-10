// Curated from official sources. Recheck eligibility before changing these summaries.
// One entry per program; fields support future additions without changing page layout.
export const RESOURCE_CHECKED_DATE = '2026-09-10'
export const PROGRAMS = [
  {
    id: 'primes', title: 'MIT PRIMES', organization: 'Massachusetts Institute of Technology',
    fullName: 'Program for Research In Mathematics, Engineering, and Science',
    subject: 'Mathematics & computing', format: 'In person', location: 'Greater Boston, USA', cost: 'Free',
    audience: 'High-school sophomores and juniors in Greater Boston.',
    description: 'A year-long mentored research program in mathematics and related areas of computing and biology.',
    note: 'Advanced preparation expected. Check the official track requirements.',
    href: 'https://math.mit.edu/research/highschool/primes/',
  },
  {
    id: 'primes-usa', title: 'PRIMES-USA', organization: 'Massachusetts Institute of Technology',
    fullName: 'Remote mathematics research through MIT PRIMES',
    subject: 'Mathematics', format: 'Remote', location: 'USA · outside Greater Boston', cost: 'Free',
    audience: 'U.S.-resident sophomores and juniors outside Greater Boston, including equivalent-age homeschool students.',
    description: 'Work on a mentored mathematics project over a year through remote collaboration.',
    note: 'Strong mathematical preparation and a substantial weekly commitment expected.',
    href: 'https://math.mit.edu/research/highschool/primes/usa/',
  },
  {
    id: 'rsi', title: 'Research Science Institute', organization: 'Center for Excellence in Education · hosted at MIT',
    fullName: 'Research Science Institute (RSI)',
    subject: 'Science & mathematics', format: 'In person', location: 'Cambridge, Massachusetts, USA', cost: '',
    audience: 'Rising high-school seniors; U.S. and international participants.',
    description: 'A six-week summer program combining a mentored research project with a final presentation.',
    note: 'Highly selective. Application routes and requirements vary by country.',
    href: 'https://math.mit.edu/research/highschool/rsi/',
  },
  {
    id: 'crowdmath', title: 'CrowdMath', organization: 'MIT PRIMES & Art of Problem Solving',
    fullName: 'Collaborative online mathematics research',
    subject: 'Mathematics', format: 'Remote', location: 'Worldwide', cost: '',
    audience: 'High-school and college students around the world.',
    description: 'Join an online group exploring an open mathematics problem. Read the current project to gauge the level.',
    note: 'Open collaboration rather than an individual mentor placement.',
    href: 'https://artofproblemsolving.com/polymath/mitprimes',
    sourceHref: 'https://math.mit.edu/research/highschool/primes/',
  },
  {
    id: 'nasa', title: 'NASA Citizen Science', organization: 'National Aeronautics and Space Administration',
    fullName: 'Contribute to space and Earth science',
    subject: 'Space & Earth science', format: 'Varies by project', location: 'Many projects can be done from home', cost: '',
    audience: 'Volunteers; check the age, equipment, and location requirements of each project.',
    description: 'Classify real scientific data or contribute observations. Many projects need only a phone or laptop.',
    note: 'A place to try participating in research, rather than a mentored summer program.',
    href: 'https://science.nasa.gov/citizen-science/',
  },
]

export const MENTOR_DIRECTORIES = [
  { id: 'stanford', title: 'Stanford Profiles', description: 'Search by topic or department. Explore research interests, publications, and contact details.', href: 'https://profiles.stanford.edu/', source: 'Stanford University' },
  { id: 'brown', title: 'Researchers @ Brown', description: 'Search for an expert and explore faculty research profiles across fields.', href: 'https://vivo.brown.edu/', source: 'Brown University' },
]

export const RESOURCES = [
  { id: 'scholar', title: 'Google Scholar', category: 'Papers', description: 'Search scholarly papers and follow their references. Start with a few words from your question.', href: 'https://scholar.google.com/', source: 'Google' },
  { id: 'scholar-help', title: 'Google Scholar search help', category: 'Papers', description: 'Learn to refine a search, follow citations, and find available full text.', href: 'https://scholar.google.com/intl/en/scholar/help.html', source: 'Google' },
  { id: 'data-gov', title: 'Data.gov', category: 'Data', description: 'Find U.S. government datasets. Check each dataset’s documentation, coverage, and limitations before using it.', href: 'https://catalog.data.gov/', source: 'U.S. government' },
  { id: 'zotero', title: 'Zotero', category: 'Source management', description: 'Collect sources and organize citations as you read. The quick-start guide explains the basics.', href: 'https://www.zotero.org/support/quick_start_guide', source: 'Zotero' },
]
