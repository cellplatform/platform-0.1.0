import { useEffect, useState } from 'react';
import { Subject } from 'rxjs';
import { distinctUntilChanged, filter, takeUntil } from 'rxjs/operators';

import { Http, Parse, rx, t } from '../common';

type InstanceId = string;
type Url = string;

/**
 * State controller.
 */
export function useStateController(args: {
  bus: t.EventBus<any>;
  component: InstanceId;
  onChanged?: t.ManifestSelectorChangedHandler;
}) {
  const { component } = args;
  const bus = rx.busAsType<t.ManifestSelectorEvent>(args.bus);

  const [error, setError] = useState<string>('');
  const [manifestUrl, setManifestUrlState] = useState<string>('');
  const [manifest, setManifestState] = useState<t.ModuleManifest>();

  const setManifest = (url: Url, manifest: t.ModuleManifest | undefined) => {
    url = (url || '').trim();
    setManifestUrlState(url);
    setManifestState(manifest);
    bus.fire({
      type: 'sys.runtime.web/ManifestSelector/current',
      payload: { component, url: manifest ? url : '', manifest },
    });
  };

  /**
   * Lifecycle
   */
  useEffect(() => {
    const dispose$ = new Subject<void>();

    type A = t.ManifestSelectorActionEvent;
    type C = t.ManifestSelectorCurrentEvent;
    const $ = bus.$.pipe(
      takeUntil(dispose$),
      filter((e) => e.type.startsWith('sys.runtime.web/ManifestSelector/')),
      filter((e) => e.payload.component === component),
    );
    const action$ = rx.payload<A>($, 'sys.runtime.web/ManifestSelector/action');
    const current$ = rx.payload<C>($, 'sys.runtime.web/ManifestSelector/current');

    action$.pipe(filter((e) => e.kind === 'loadManifest')).subscribe((e) => {
      api.loadManifest(e.manifest);
    });

    current$
      .pipe(
        distinctUntilChanged(
          (prev, next) => prev.manifest?.hash.module === next.manifest?.hash.module,
        ),
      )
      .subscribe((e) => {
        const { url, manifest } = e;
        args.onChanged?.({ url, manifest });
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
      setManifest(value, undefined);
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

        setManifest(url.href, manifest);
      } catch (error: any) {
        setError(`Failed to parse URL`);
      }
    },
  };

  return api;
}
