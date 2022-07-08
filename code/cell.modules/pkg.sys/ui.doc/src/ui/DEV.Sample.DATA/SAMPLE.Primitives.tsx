import { t, author, category, COMMONTEXT } from './common';
import { BLOCKS } from './SAMPLE.Primitives.BLOCKS';

/**
 * Document: "Fractal Primitives to Network Scale"
 */
export const PRIMITIVES: t.DocDef = {
  id: 'primitives',
  path: '/docs/dao/primitives-scale',

  banner: { url: 'https://tdb-hum31enzb-tdb.vercel.app/banner.jpg', height: 360 },
  version: '1.0.1 (Jun, 2022)',
  author,
  category,
  title: `DAOs: Fractal Primitives\nto Network Scale`,

  blocks: [
    //
    COMMONTEXT.ORIG_PUBLISHED_BLOCK,
    ...BLOCKS,
  ],
};
