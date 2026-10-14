// Turns src/data/publications.bib into the records the site renders.
// Spec: https://github.com/bevankoopman/bevankoopman.github.io/issues/5
import { existsSync } from 'node:fs';
import { parse } from '@retorquere/bibtex-parser';

export type TypeGroup = 'journal' | 'conference' | 'workshop' | 'preprint' | 'other';

export const TYPE_GROUPS: { id: TypeGroup; label: string }[] = [
  { id: 'journal', label: 'Journal' },
  { id: 'conference', label: 'Conference' },
  { id: 'workshop', label: 'Workshop & shared task' },
  { id: 'preprint', label: 'Preprint' },
  { id: 'other', label: 'Other' },
];

const GROUP_OF: Record<string, TypeGroup> = {
  journal: 'journal',
  long: 'conference', short: 'conference',
  notebook: 'workshop', workshop: 'workshop', abstract: 'workshop',
  preprint: 'preprint',
  thesis: 'other', editor: 'other', tutorial: 'other', demo: 'other', data: 'other', code: 'other',
};

// Short venue names, first match wins. Order matters (SIGIR-AP before SIGIR, etc.).
const VENUES: [RegExp, string][] = [
  [/SIGIR Forum/i, 'SIGIR Forum'],
  [/SIGIR-AP|Asia Pacific Region/i, 'SIGIR-AP'],
  [/SIGIR/i, 'SIGIR'],
  [/European Conference on Information Retrieval|\bECIR\b/i, 'ECIR'],
  [/\bCIKM\b|Information and Knowledge Management/i, 'CIKM'],
  [/\bWSDM\b|Web Search and Data Mining/i, 'WSDM'],
  [/\bICTIR\b|Theory of Information Retrieval/i, 'ICTIR'],
  [/Web Conference|\bWWW\b/i, 'WWW'],
  [/Findings of .*EMNLP|EMNLP Findings/i, 'EMNLP Findings'],
  [/\bEMNLP\b|Empirical Methods in Natural Language/i, 'EMNLP'],
  [/European Chapter of the Association for Computational|\bEACL\b/i, 'EACL'],
  [/North American Chapter|\bNAACL\b/i, 'NAACL'],
  [/BioNLP|Biomedical Language Processing/i, 'BioNLP'],
  [/Association for Computational Linguistics|\bACL\b/i, 'ACL'],
  [/\bAMIA\b|American Medical Informatics/i, 'AMIA'],
  [/\bJAMIA\b|Journal of the American Medical Informatics/i, 'JAMIA'],
  [/\bADCS\b|Australasian Document Computing/i, 'ADCS'],
  [/\bALTA\b|Australasian Language Technology/i, 'ALTA'],
  [/\bTREC\b|Text REtrieval Conference/i, 'TREC'],
  [/\bCLEF\b|ImageCLEF/i, 'CLEF'],
  [/Transactions on Information Systems|\bTOIS\b/i, 'TOIS'],
  [/\bJASIST\b|Journal of the American Society for Information Science|Journal of the Association for Information Science/i, 'JASIST'],
  [/Information Retrieval Journal|Information Retrieval\s*$/i, 'IRJ'],
  [/Artificial Intelligence in Medicine/i, 'AIM'],
  [/Journal on Digital Libraries|Journal of Digital Libraries/i, 'IJDL'],
  [/arXiv/i, 'arXiv'],
];

export interface Author { name: string; me: boolean }

export interface Publication {
  id: string;
  title: string;
  authors: Author[];
  year: number;
  venue: string;
  venueShort: string;
  group: TypeGroup;
  pubtype: string;
  pdf?: string;
  slides?: string;
  code?: string;
  doi?: string;
  url?: string;
  arxiv?: string;
  featured?: string;
  bibtex: string;
  [key: string]: unknown;
}

// Fields only this site uses; stripped from the "Cite" BibTeX.
const PRIVATE_FIELDS = ['pdf', 'slides', 'code', 'pubtype', 'featured', 'date-added', 'date-modified', 'bdsk-url-\\d+', 'file'];

const plain = (s: unknown) => String(s ?? '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();

function initials(first: string) {
  return first.split(/[\s]+/).filter(Boolean)
    .map((p) => p.split('-').map((q) => (q.endsWith('.') && q.length <= 3 ? q : q[0] + '.')).join('-'))
    .join(' ');
}

function cleanBibtex(input: string) {
  const drop = new RegExp(`^\\s*(${PRIVATE_FIELDS.join('|')})\\s*=.*$\\n?`, 'gim');
  return input.replace(drop, '').trim();
}

function deriveGroup(type: string, venue: string, pubtype?: string): TypeGroup {
  if (pubtype && GROUP_OF[pubtype]) return GROUP_OF[pubtype];
  if (/arxiv/i.test(venue)) return 'preprint';
  if (type === 'article') return 'journal';
  if (type === 'inproceedings' || type === 'conference') return 'conference';
  return 'other';
}

export function parsePublications(text: string): Publication[] {
  const bib = parse(text, { sentenceCase: false, unsupported: 'ignore' });
  if (bib.errors.length) throw new Error(`publications.bib: ${JSON.stringify(bib.errors.slice(0, 3))}`);

  const pubs = bib.entries.map((e): Publication => {
    const f = e.fields as Record<string, any>;
    const venue = plain(f.booktitle || f.journal || f.school || f.institution || f.publisher || '');
    const short = VENUES.find(([re]) => re.test(venue))?.[1];
    const arxiv = (`${venue} ${f.eprint ?? ''} ${f.journal ?? ''}`.match(/(\d{4}\.\d{4,5})/) || [])[1];
    const authors = (f.author ?? f.editor ?? []).map((a: any): Author => {
      const name = a.name ?? [a.firstName && initials(a.firstName), a.lastName].filter(Boolean).join(' ');
      return { name, me: a.lastName === 'Koopman' && /^B/.test(a.firstName ?? '') };
    });
    const year = Number(f.year) || 0;
    for (const k of ['pdf', 'slides'] as const) {
      if (f[k] && !existsSync(`public/${f[k]}`)) throw new Error(`publications.bib: ${e.key} ${k} not found: public/${f[k]}`);
    }
    return {
      id: e.key,
      title: plain(f.title),
      authors,
      year,
      venue,
      venueShort: short && short !== 'arXiv' ? `${short} ${year || ''}`.trim() : short === 'arXiv' ? 'arXiv' : venue,
      group: deriveGroup(e.type, venue, f.pubtype),
      pubtype: f.pubtype ?? '',
      pdf: f.pdf && `/${f.pdf}`,
      slides: f.slides && `/${f.slides}`,
      code: f.code,
      doi: f.doi && plain(f.doi).replace(/^https?:\/\/(dx\.)?doi\.org\//, ''),
      url: f.url && plain(f.url),
      arxiv,
      featured: f.featured,
      bibtex: cleanBibtex(e.input),
    };
  });
  // Newest first; stable within a year by title.
  return pubs.sort((a, b) => b.year - a.year || a.title.localeCompare(b.title));
}
