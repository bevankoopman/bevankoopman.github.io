import { defineCollection } from 'astro:content';
import { file } from 'astro/loaders';
import { parsePublications } from './lib/publications';

const publications = defineCollection({
  loader: file('src/data/publications.bib', { parser: parsePublications }),
});

export const collections = { publications };
