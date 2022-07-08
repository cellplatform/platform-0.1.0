import { author, category, COMMONTEXT, t } from './common';
import { BLOCKS } from './SAMPLE.Flows.BLOCKS';

/**
 * Document: "Flows"
 */
export const FLOWS: t.DocDef = {
  id: 'flows',
  path: '/docs/dao/flows-not-things',

  banner: { url: 'https://tdb-dz1qc4pzn-tdb.vercel.app/dao-1.png', height: 360 },
  version: '1.0.1 (Apr 2022)',
  author,
  category,
  title: `DAOs aren’t things...\nthey are flows.`,
  // subtitle: `Web3 is giving us the opportunity to rewrite how groups of people come together and do things in the world. But are we importing a core concept from our existing paradigm without realising it?`,

  blocks: [
    //
    COMMONTEXT.ORIG_PUBLISHED_BLOCK,
    ...BLOCKS,
  ],
};
