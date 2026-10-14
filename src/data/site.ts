// Content decided in "Decide content and sections" (issue #6).
export const site = {
  name: 'Bevan Koopman',
  eyebrow: 'Principal Research Scientist, Team Lead @ CSIRO · Associate Professor, UQ',
  role: 'Search, LLMs & language technologies',
  bio: 'I research how large language models can search, rank and reason over information, and how to evaluate AI systems we can trust.',
  email: 'bevan.koopman@csiro.au',
  location: 'Brisbane, Australia',
  affiliation: 'CSIRO Australian e-Health Research Centre · The University of Queensland',
  photo: '/img/bevan_koopman-sketch.jpg',
  links: {
    scholar: 'https://scholar.google.com.au/citations?user=twCn-tYAAAAJ',
    github: 'https://github.com/bevankoopman',
    linkedin: 'https://au.linkedin.com/in/bevankoopman',
    // TODO: replace with the dblp.org/pid/... profile URL (dblp blocked automated lookup).
    dblp: 'https://dblp.org/search?q=Bevan+Koopman',
  },
};

export const themes = [
  {
    id: 'llm-search',
    icon: '🔎',
    title: 'LLMs for search',
    blurb: 'LLM-based rankers and rerankers, dense and generative retrieval, and retrieval-augmented generation.',
  },
  {
    id: 'agentic-eval',
    icon: '🤖',
    title: 'Agentic evaluation of AI',
    blurb: 'Using agents to evaluate AI systems without labels: RAG quality, hallucination, and robustness to prompt injection.',
  },
  {
    id: 'medical-ai',
    icon: '🩻',
    title: 'Medical AI',
    blurb: 'Chest X-ray report generation, systematic-review automation and clinical-trial matching.',
  },
];
