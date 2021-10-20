import { useState } from 'react';

import { Http, t, Parse } from '../common';

type Url = string;

/**
 * State controller.
 */
export function useStateController() {
  const [manifest, setManifest] = useState<t.ModuleManifest>();
  const [manifestUrl, setManifestUrl] = useState<string>('');
  const [error, setError] = useState<string>('');
  const clearError = () => setError('');

  const api = {
    manifest,

    get manifestUrl() {
      return manifestUrl;
    },
    set manifestUrl(value: Url) {
      console.log('value', value);
      setManifestUrl((value || '').trim());
      clearError();
    },

    get remoteEntryUrl() {
      return Parse.remoteEntryUrl(manifestUrl, manifest);
    },

    /**
     * Error
     */
    get error() {
      return error;
    },
    set error(message: string) {
      setError(message);
    },
    clearError,

    /**
     * Load the manigest
     */
    async loadManifest(href?: string) {
      try {
        const url = Parse.manifestUrl(href === undefined ? manifestUrl : href);
        api.manifestUrl = url.href;

        const http = Http.create();
        const res = await http.get(url.href);
        if (!res.ok) {
          const status = res.status > 0 ? `[${res.status}]` : '';
          return setError(`Failed to load URL. ${res.statusText} ${status}`.trim());
        }

        const manifest = res.json as t.ModuleManifest;
        if (manifest.kind !== 'module' || !manifest.module) {
          return setError(`The pulled JSON is not a module manifest.`);
        }

        const remote = manifest.module.remote;
        if (!remote) {
          return setError(`The manifest has no exports`);
        }

        setManifest(manifest);
      } catch (error: any) {
        setError(`Failed to parse URL`);
      }
    },
  };

  return api;
}
