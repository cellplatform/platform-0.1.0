import { useEffect, useState } from 'react';

import { t, Http } from '../common';

const MOCK: t.ModuleManifest = {
  kind: 'module',
  hash: {
    files: 'sha256-73794e8fb93173aaa883aa595b322c3976596e2cb58fff4210c74643ca0ad56c',
    module: 'sha256-94aacbf4ae6c5ab206b3d4cb5674fdecebf1f814b54f1fbfec646760edd23549',
  },
  module: {
    namespace: 'ns.mock',
    version: '0.0.0',
    compiler: '@platform/cell.compiler@0.0.0',
    compiledAt: 1636667570203,
    mode: 'production',
    target: 'web',
    entry: 'index.html',
  },
  files: [],
};

/**
 * Load the local manifest JSON file.
 */
export function useManifest(options: { url?: string } = {}) {
  const [json, setJson] = useState<t.ModuleManifest | undefined>();
  const isLocalhost = location.hostname === 'localhost';

  /**
   * Lifecycle
   */
  useEffect(() => {
    if (isLocalhost && !options.url) {
      setJson(MOCK);
      return;
    }

    const url = options.url ?? '/index.json';
    pullManifest(url, (json) => setJson(json));
  }, []); // eslint-disable-line

  /**
   * Api
   */
  return { json, isMock: isLocalhost };
}

/**
 * Helpers
 */

const pullManifest = async (url: string, onComplete?: (json?: t.ModuleManifest) => void) => {
  const done = (json?: t.ModuleManifest) => {
    onComplete?.(json);
    return json;
  };
  const res = await Http.create().get(url);
  const json = res.ok && res.json ? res.json : undefined;
  return done(json as t.ModuleManifest);
};
