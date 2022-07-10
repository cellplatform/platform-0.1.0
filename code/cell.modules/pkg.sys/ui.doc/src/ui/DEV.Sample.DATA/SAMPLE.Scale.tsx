import { t, author, category, COMMONTEXT } from './common';
import { BLOCKS } from './SAMPLE.Scale.BLOCKS';

/**
 * Document: "Scale"
 */
export const SCALE: t.DocDef = {
  id: 'scale',
  path: '/docs/dao/scale-levers',

  banner: { url: 'https://tdb-4hea4bo0w-tdb.vercel.app/banner-scale.png', height: 370 },
  version: '1.0.3 (May 2022)',
  author,
  category,
  title: `Scale and the levers that\nprovide DAOs their power.`,

  blocks: [
    //
    COMMONTEXT.ORIG_PUBLISHED_BLOCK,
    ...BLOCKS,
  ],
};
