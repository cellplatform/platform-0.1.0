import { useEffect, useState } from 'react';

import { t, Http, ManifestUrl } from '../common';

const MOCK: t.ModuleManifest = {
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

/**
 * Load the local manifest JSON file.
 */
export function useManifest(options: { url?: string } = {}) {
  const [json, setJson] = useState<t.ModuleManifest | undefined>();

  const isLocalhost = location.hostname === 'localhost';
  const isMock = isLocalhost && !options.url;

  const getHref = () => {
    return options.url ?? `${location.host}/index.json`;
  };

  const getUrl = () => {
    return ManifestUrl.parse(getHref());
  };

  /**
   * Lifecycle
   */
  useEffect(() => {
    if (isMock) {
      return setJson(MOCK);
    }

    if (!isMock) {
      pullManifest(getHref(), (json) => setJson(json));
    }
  }, [options.url, isMock]); // eslint-disable-line

  /**
   * Api
   */
  return {
    isMock,
    json,
    get url() {
      return getUrl();
    },
  };
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
