export * from '../common';
import { t } from '../common';

export const author: t.DocDef['author'] = {
  name: 'Rowan Yeoman',
  avatar: 'https://tdb-4wu2h9jfp-tdb.vercel.app/avatar.png',
};

export const category = 'Conceptual Framing Series';

/**
 * Inserts
 */
const REF = {
  SB: `[@superbenefit](https://superbenefit.mirror.xyz)`,
  RO_ETH: `[yeoro.eth](https://mirror.xyz/yeoro.eth)`,
};

// const ORIG_PUBLISHED = `This article was originally published on ${REF.RO_ETH} → ${REF.SB}.`;
const ORIG_PUBLISHED_BLOCK: t.DocDefBlock = {
  kind: 'InsetPanel',
  markdown: `
*This article was originally published on ${REF.RO_ETH} → ${REF.SB}.*
`,
};

export const COMMONTEXT = {
  ORIG_PUBLISHED_BLOCK,
};
