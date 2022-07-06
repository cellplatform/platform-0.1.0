import { t, author, category, COMMONTEXT } from './common';
import { BLOCKS } from './SAMPLE.Primitives.BLOCKS';

/**
 * Document: "Fractal Primitives to Network Scale"
 */
export const PRIMITIVES: t.DocDef = {
  id: 'primitives',
  path: '/docs/dao/primitives-scale',

  banner: { url: 'https://tdb-hum31enzb-tdb.vercel.app/banner.jpg' },
  version: '1.0.1 (Jun, 2022)',
  author,
  category,
  title: `DAOs: Fractal Primitives to Network Scale`,
  // subtitle: `DAOs are extraordinary for their capacity to test experimental ideas. But, in order to have a transformational impact on the world, we need DAOs to scale beyond experiments.`,

  blocks: [
    //
    COMMONTEXT.ORIG_PUBLISHED_BLOCK,
    ...BLOCKS,
  ],
};
