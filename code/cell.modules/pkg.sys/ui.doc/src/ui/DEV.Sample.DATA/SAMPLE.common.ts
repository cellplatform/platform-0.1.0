import { t } from '../common';

export const author: t.DocDef['author'] = {
  name: 'Rowan Yeoman',
  avatar: 'https://tdb-4wu2h9jfp-tdb.vercel.app/avatar.png',
  signature: 'https://tdb-boie1kfi2-tdb.vercel.app/signature.png',
};

export const category = 'Conceptual Framing Series';

/**
 * Inserts
 */
const REF = {
  SB: `[@superbenefit](https://superbenefit.mirror.xyz)`,
  RO_ETH: `[yeoro](https://twitter.com/yeoro)`,
};

const ORIG_PUBLISHED_BLOCK: t.DocDefBlock = {
  kind: 'InsetPanel',
  markdown: `*This article was originally published on ${REF.RO_ETH} → ${REF.SB}.*`,
};

export const COMMONTEXT = {
  ORIG_PUBLISHED_BLOCK,
};
