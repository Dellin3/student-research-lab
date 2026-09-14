export const RESEARCH_STEPS = [
  {
    id: 'notice', label: 'Choose a question', title: 'Start with something you notice.',
    description: 'Research means asking a focused question, looking for evidence, and explaining what that evidence can—and cannot—tell you. You can begin with something ordinary.',
    actions: ['Choose one thing you want to understand.', 'Make it smaller: one place, one text, one pattern, or one comparison.', 'Write a question you could explore with the time and materials you have.'],
    link: '/topic-narrowing', linkLabel: 'Help me narrow an interest',
    alternative: ['/research-question-builder', 'I already have a topic'],
  },
  {
    id: 'read', label: 'Read a little', title: 'Find out what is already known.',
    description: 'Start with one clear overview from a university, museum, or established publication. Then follow a reference to an original study. You do not need to understand every technical detail.',
    actions: ['Search two or three words from your question.', 'Keep one useful source and note who wrote it.', 'Write one thing you learned and one thing you still do not understand.'],
    link: '/resources?view=sources', linkLabel: 'Find papers & data',
    alternative: ['/ai-literature', 'How to read a paper'],
  },
  {
    id: 'try', label: 'Try something small', title: 'Do one thing that could teach you something.',
    description: 'A first attempt can be a small calculation, a close reading, a comparison, or an analysis of public data. Choose evidence you can actually inspect.',
    actions: ['Decide what you will compare or examine.', 'Write down your method so someone else could follow it.', 'Keep the result, including surprises and failed attempts.'],
    link: '/investigation-planner', linkLabel: 'Plan a small investigation',
    alternative: ['/build-a-project', 'Help me choose a method'],
  },
  {
    id: 'reflect', label: 'Reflect & ask', title: 'Decide what the evidence changes.',
    description: 'A useful result does not have to confirm your idea. Explain what happened, name what remains uncertain, and choose your next question.',
    actions: ['Separate what you observed from what you think it means.', 'Write one limitation or another possible explanation.', 'Share a short summary with a teacher, or decide what to try next.'],
    link: '/resources?view=mentors', linkLabel: 'Find someone to ask',
    alternative: ['/worksheet', 'Keep my research notes'],
  },
]

export const STARTER_EXAMPLES = [
  {
    id: 'environment', label: 'Environment', interest: 'Shade & city heat',
    question: 'Are shaded surfaces cooler than sunny surfaces in the same courtyard?',
    steps: [
      ['A smaller question', 'Compare shaded and sunny surfaces in one courtyard, rather than trying to explain the climate of a whole city.', 'Question', 'Are shaded surfaces cooler than sunny surfaces in the same courtyard?'],
      ['A useful search', 'Search “shade surface temperature.” Read an overview of urban heat and note the difference between surface temperature and air temperature.', 'Keep one source', 'Who wrote it? What did they measure? What remains unclear?'],
      ['A first comparison', 'With permission, compare the same surface material in shade and sun at similar times. Record the weather and repeat the observations.', 'Keep a record', 'Location · material · time · shade · surface temperature'],
      ['A careful conclusion', 'Describe your observations. Material, weather, and time of day could also explain a difference; a small comparison cannot isolate every cause.', 'Next question', 'Does the pattern persist when the weather or time changes?'],
    ],
  },
  {
    id: 'mathematics', label: 'Mathematics', interest: 'Patterns in numbers',
    question: 'Why is the sum of the first n odd numbers equal to n²?',
    steps: [
      ['A smaller question', 'Choose one pattern you can calculate and explain, rather than a whole subject such as number theory.', 'Question', 'Why is the sum of the first n odd numbers equal to n²?'],
      ['A useful search', 'Look for an explanation of sums of odd numbers and a visual proof. Try to explain each step in your own words.', 'Keep one source', 'What does the argument assume? Why does it cover every positive integer?'],
      ['A first argument', 'Calculate the first few sums. Draw how the next odd number adds a new border to a square, then turn that picture into an argument.', 'Keep a record', 'Examples · diagram · explanation for general n'],
      ['A careful conclusion', 'Checking examples suggests a pattern; a proof explains why it always holds. This is a known result to learn from, not a claim of a new discovery.', 'Next question', 'What changes if you start at a later odd number?'],
    ],
  },
  {
    id: 'humanities', label: 'Humanities', interest: 'How stories change',
    question: 'How do two newspapers describe the same historical event differently?',
    steps: [
      ['A smaller question', 'Pick one event and two articles published close to it. A small set of texts lets you examine the language carefully.', 'Question', 'How do two newspapers describe the same historical event differently?'],
      ['A useful search', 'Find an overview of the event, then locate two original articles in a public archive. Record each article’s author, date, and publication.', 'Keep one source', 'Who was the intended audience? What context helps explain the article?'],
      ['A first comparison', 'Compare the headlines, quoted voices, and descriptions in both articles. Keep short quotations with precise citations.', 'Keep a record', 'Passage · source · wording · possible interpretation'],
      ['A careful conclusion', 'Explain the differences using the texts. Two articles cannot represent every reader, newspaper, or public opinion at the time.', 'Next question', 'Would another article support or complicate this interpretation?'],
    ],
  },
]
