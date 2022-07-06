import { t, author, category, COMMONTEXT } from './common';
import { BLOCKS } from './SAMPLE.Scale.BLOCKS';

/**
 * Document: "Scale"
 */
export const SCALE: t.DocDef = {
  id: 'scale',
  path: '/docs/dao/scale-levers',

  banner: { url: 'https://tdb-4hea4bo0w-tdb.vercel.app/banner-scale.png' },
  version: '1.0.3 (May 2022)',
  author,
  category,
  title: `Scale and the levers that\nprovide DAOs their power.`,
  // subtitle: `Web3 presents the possibility of a new paradigm to replace the company-centric paradigm that has been evolving over the past 400 years.`,

  blocks: [
    //
    COMMONTEXT.ORIG_PUBLISHED_BLOCK,
    ...BLOCKS,
  ],
};
