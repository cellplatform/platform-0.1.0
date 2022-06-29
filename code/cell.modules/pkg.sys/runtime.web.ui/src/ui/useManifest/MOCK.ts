import { t } from '../common';

export const MOCK: t.ModuleManifest = {
  kind: 'module',
  hash: {
    files: 'sha256-73794e8fb93173aaa883aa595b322c3976596e2cb58fff4210c74643ca0ad56c',
    module: 'sha256-94aacbf4ae6c5ab206b3d4cb5674fdecebf1f814b54f1fbfec646760edd23549',
  },
  module: {
    namespace: 'mock.foobar',
    version: '0.0.0',
    compiler: '@platform/cell.compiler@0.0.0',
    compiledAt: 1636667570203,
    mode: 'production',
    target: 'web',
    entry: 'index.html',
  },
  files: [],
};
