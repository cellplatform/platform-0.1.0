import * as t from './types';

const ERROR_MANIFEST: t.DirManifest = {
  kind: 'dir',
  dir: { indexedAt: -1 },
  hash: { files: '' },
  files: [],
};

export const DEFAULT = {
  ERROR_MANIFEST,
};
