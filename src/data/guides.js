export const GUIDE_UPDATED_DATE = '2026-10-07'

export const GUIDES = [
  {
    path: '/guides/research-without-a-mentor',
    title: 'How to Start High-School Research Without a Mentor | Research Starter Lab',
    heading: 'How to start research without a mentor',
    description: 'A practical first project for high-school students: narrow a question, use public evidence, record a small attempt, and ask for focused feedback.',
    answer: 'You can begin a small independent research project by choosing a narrow question, using evidence you can access, recording one attempt, and asking a teacher for feedback. Begin with a literature comparison, a mathematical example, or public data. You do not need a university lab to take these first steps.',
    sources: [
      { title: 'Google Scholar: finding papers and following references', url: 'https://scholar.google.com/intl/en/scholar/help.html' },
      { title: 'Data.gov: public datasets and their source records', url: 'https://catalog.data.gov/' },
      { title: 'Zotero: keeping sources and notes together', url: 'https://www.zotero.org/support/quick_start_guide' },
    ],
  },
  {
    path: '/guides/read-your-first-paper',
    title: 'How to Read Your First Research Paper | Research Starter Lab',
    heading: 'How to read your first research paper',
    description: 'Read a paper in manageable passes: identify the question, follow one result to its evidence, check limitations, and make a source-linked research note.',
    answer: 'Start by identifying the paper’s question and main claim. Then follow one result back to the figure, method, or proof that supports it. Write what the evidence establishes, what remains uncertain, and one question for your next reading. You can leave unfamiliar details for a later pass.',
    sources: [
      { title: 'Carey, Steiner & Petri: Ten simple rules for reading a scientific paper (2020)', url: 'https://journals.plos.org/ploscompbiol/article?id=10.1371/journal.pcbi.1008032' },
      { title: 'Google Scholar: full-text access, related articles, and citation search', url: 'https://scholar.google.com/intl/en/scholar/help.html' },
      { title: 'Zotero: items, attachments, notes, and citations', url: 'https://www.zotero.org/support/quick_start_guide' },
    ],
  },
]

export function getGuide(path) { return GUIDES.find(guide => guide.path === path) }
