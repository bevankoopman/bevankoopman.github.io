// Content decided in "Decide content and sections" (issue #6).
export const site = {
  name: 'Bevan Koopman',
  role: 'Principal Research Scientist, Team Lead @ Commonwealth Scientific & Industrial Research Organisation (CSIRO) · Associate Professor, University of Queensland',
  // Browser tab / search-result title only; not shown on the page.
  tagline: 'Information Retrieval (Search), LLMs & health',
  bio: 'Experienced AI researcher and technical leader with deep expertise in Information Retrieval (Search) and LLMs. Proven ability to develop and deploy high-impact AI systems, lead research-driven innovation, and guide engineering teams to success in academic and industry settings. Extensive experience in the health space.',
  email: 'bevan.koopman@csiro.au',
  location: 'Brisbane, Australia',
  affiliation: 'CSIRO Australian e-Health Research Centre · The University of Queensland',
  photo: '/img/bevan_koopman-sketch.jpg',
  links: {
    scholar: 'https://scholar.google.com.au/citations?user=twCn-tYAAAAJ',
    github: 'https://github.com/bevankoopman',
    linkedin: 'https://au.linkedin.com/in/bevankoopman',
    dblp: 'https://dblp.org/pid/96/9899.html',
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

// Projects, experience and education are drawn from Koopman-CV-Industry.tex.
// `paper` is a publications.bib key; the card links to that entry in the list.
export const projects = [
  {
    name: 'Oscar',
    title: 'Precision medicine search for kids cancer',
    blurb: 'A search engine that helps oncologists find the best treatments for childhood cancer based on a child\'s genetic profile.',
    highlights: [
      'In trial with real patients at Queensland and Sydney Children\'s Hospitals',
      'Secured $1m in donor funding; led a team of four engineers',
      'Nominated for the Queensland AI Awards (Outstanding AI Collaboration)',
    ],
    paper: 'Koopman:2021wg',
  },
  {
    name: 'CXRMate',
    title: 'Multimodal LLM for radiology report generation',
    blurb: 'Automatically generates radiology reports from chest X-rays, using auxiliary patient data.',
    highlights: [
      'Top-5 system worldwide on the ReXrank report generation benchmark',
      'Live trial at Princess Alexandra Hospital, Brisbane',
    ],
    paper: 'Nicolson:2024aa',
  },
  {
    name: 'GuideStream.AI',
    title: 'LLM-driven clinical guideline recommendations',
    blurb: 'A UQ/CSIRO spin-out: a RAG system giving clinicians real-time access to the clinical guidelines relevant to their patient.',
    highlights: [
      'Co-founder, with overall technical responsibility for the architecture',
      'Designed Evalugator, an end-to-end evaluation pipeline over real and synthetic data',
    ],
  },
  {
    name: 'AgAsk',
    title: 'A conversational agent for agriculture',
    blurb: 'An LLM-based chatbot that helps growers make evidence-based decisions from the scientific literature.',
    highlights: [
      '$750k funding from the Grains Research and Development Corporation',
      '13 publications with over 300 citations',
    ],
    paper: 'Li:2023aa',
  },
  {
    name: 'Cancer death classifier',
    title: 'Monitoring cancer-related deaths',
    blurb: 'Machine learning that classifies free-text death certificates for Queensland Health\'s cancer statistics.',
    highlights: [
      'In production for 8 years, providing cancer statistics annually',
      'Method paper cited 150 times',
    ],
    paper: 'Koopman:2015ad',
  },
];

export const experience = [
  {
    years: '2014–now',
    role: 'Health AI Team Lead / Principal Research Scientist',
    org: 'CSIRO',
    blurb: 'Leads the Health Data & Machine Learning team in CSIRO\'s eHealth program, applying search and NLP to real-world healthcare.',
  },
  {
    years: '2023–now',
    role: 'Principal Research Fellow / Lab Co-Director',
    org: 'The University of Queensland',
    blurb: 'Co-directs the ielab; LLMs for search, recommendation and text analysis, and commercialisation through UQ\'s incubator.',
  },
  {
    years: '2014–2015',
    role: 'Postdoctoral Research Fellow',
    org: 'Australian e-Health Research Centre, CSIRO',
    blurb: 'Search and NLP for medical text, with live NLP systems deployed at Queensland Health and Cancer Institute NSW.',
  },
  {
    years: '2009–2010',
    role: 'Senior Software Engineer',
    org: 'eResearch group, University of Queensland',
    blurb: 'Semantic and spatial search of scientific datasets, adopted by the Australian National Data Service.',
  },
  {
    years: '2008–2009',
    role: 'Senior Software Consultant',
    org: 'Permeance Technologies',
    blurb: 'Software engineering at a startup including requirements, design, implementation and DevOps.',
  },
  {
    years: '2005–2007',
    role: 'Senior Software Engineer',
    org: 'Mincom (now ABB Ventyx)',
    blurb: 'Java enterprise infrastructure, including a messaging system delivered to the US Coast Guard.',
  },
];

export const education = [
  {
    years: '2010–2014',
    degree: 'PhD',
    org: 'Queensland University of Technology',
    note: 'Thesis: Semantic Search as Inference: Applications in Health Informatics. QUT Outstanding Doctoral Thesis Award.',
    link: '/phd.html',
  },
  {
    years: '1999–2002',
    degree: 'Bachelor of IT with Honours, First Class',
    org: 'The University of Queensland',
  },
];
