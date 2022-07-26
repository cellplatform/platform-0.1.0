import { useEffect, useState } from 'react';

import { t, Http, ModuleUrl } from '../common';
import { MOCK } from './MOCK';

/**
 * Load the local manifest JSON file.
 */
export const useManifest: t.UseManifestHook = (options = {}) => {
  const isLocalhost = location.hostname === 'localhost';

  const [json, setJson] = useState<t.ModuleManifest | undefined>();
  const url = options.url || ModuleUrl.ensureManifest(location.href).href;

  const is: t.ManifestHookFlags = {
    loaded: Boolean(json),
    mock: isLocalhost && !options.url,
    localhost: isLocalhost,
  };

  /**
   * Lifecycle
   */
  useEffect(() => {
    if (is.mock) {
      setJson(MOCK);
    } else {
      pullManifest(url, (json) => setJson(json));
    }
  }, [url, is.mock]); // eslint-disable-line

  useEffect(() => {
    if (json) options.onLoaded?.({ json, url, is });
  }, [url, json]); // eslint-disable-line

  /**
   * API
   */
  return {
    is,
    json,
    url,
    get version() {
      return json?.module.version || '';
    },
  };
};

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
