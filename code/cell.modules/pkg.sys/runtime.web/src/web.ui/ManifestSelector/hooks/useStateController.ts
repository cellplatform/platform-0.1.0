import { useEffect, useState } from 'react';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

import { Http, Parse, rx, t } from '../common';

type InstanceId = string;
type Url = string;

/**
 * State controller.
 */
export function useStateController(args: { bus: t.EventBus<any>; component: InstanceId }) {
  const bus = rx.busAsType<t.ManifestSelectorEvent>(args.bus);

  const [manifest, setManifest] = useState<t.ModuleManifest>();
  const [manifestUrl, setManifestUrl] = useState<string>('');
  const [error, setError] = useState<string>('');

  /**
   * Lifecycle
   */
  useEffect(() => {
    const dispose$ = new Subject<void>();

    type A = t.ManifestSelectorActionEvent;
    const $ = bus.$.pipe(
      takeUntil(dispose$),
      filter((e) => e.type.startsWith('sys.runtime.web/ManifestSelector/')),
      filter((e) => e.payload.component === args.component),
    );
    const action$ = rx.payload<A>($, 'sys.runtime.web/ManifestSelector/action');

    action$.pipe(filter((e) => e.kind === 'loadManifest')).subscribe((e) => {
      api.loadManifest(e.manifest);
    });

    action$.subscribe((e) => {
      console.log('action', e);
    });

    return () => dispose$.next();
  }, []); // eslint-disable-line

  /**
   * Public Interface
   */
  const api = {
    manifest,

    get manifestUrl() {
      return manifestUrl;
    },
    set manifestUrl(value: Url) {
      setManifestUrl((value || '').trim());
      setManifest(undefined);
      api.error = undefined;
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
    set error(message: string | undefined) {
      setError(message || '');
    },

    /**
     * Load the manifest
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
