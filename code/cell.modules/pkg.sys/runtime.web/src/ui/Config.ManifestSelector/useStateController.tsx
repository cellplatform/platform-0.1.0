import React, { useEffect, useRef, useState } from 'react';

import { Http, t, Parse } from './common';

/**
 * State controller.
 */
export function useStateController() {
  const [manifest, setManifest] = useState<t.ModuleManifest>();
  const [manifestUrl, setManifestUrl] = useState<string>('');
  const [error, setError] = useState<string>('');
  const clearError = () => setError('');

  const loadManifest = async () => {
    try {
      const href = Parse.manifestUrl(manifestUrl);
      setManifestUrl(href.href);

      const http = Http.create();
      const res = await http.get(href.href);
      if (!res.ok) {
        return setError(`[${res.status}] Failed to load url. ${res.statusText}`);
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
  };

  return {
    manifest,
    url: {
      manifest: manifestUrl,
      remoteEntry: Parse.remoteEntryUrl(manifestUrl, manifest),
    },
    error,
    loadManifest,
    clearError,
    setManifestUrl(url: string) {
      setManifestUrl((url || '').trim());
      clearError();

      console.log('url', url);
    },
  };
}

/**
 * [Helpers]
 */

// function parseManifestUrl(input: string) {
//   input = (input || '').trim().replace(/^\:*/, '').replace(/^\.*/, '');
//   if (!input.startsWith('http')) {
//     input = input.startsWith('localhost') ? `http://${input}` : `https://${input}`;
//   }
//   const url = new URL(input);
//   let path = url.pathname;
//   if (!path.endsWith('.json')) path = `${path.replace(/\/*$/, '')}/index.json`;
//   return new URL(`${url.origin}${path}${url.search}`);
// }

// export function parseRemoteEntryUrl(manifestUrl: string, manifest?: t.ModuleManifest) {
//   if (!manifestUrl || !manifest || !manifest.module.remote) return '';

//   const url = new URL(manifestUrl);
//   let path = url.pathname;
//   if (path.endsWith('.json')) {
//     const parts = path.split('/');
//     parts[parts.length - 1] = manifest.module.remote?.entry;
//     path = parts.join('/');
//   }
//   return `${url.origin}${path}${url.search}`;
// }
