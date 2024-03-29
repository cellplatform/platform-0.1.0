import { useEffect, useState } from 'react';
import { Subject } from 'rxjs';
import { distinctUntilChanged, filter, takeUntil, map } from 'rxjs/operators';
import { Is } from '../Is';

import { Http, Parse, rx, t } from '../common';

type InstanceId = string;
type Url = string;
type A = t.ManifestSelectorActionEvent;
type C = t.ManifestSelectorCurrentEvent;

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

    const $ = bus.$.pipe(
      takeUntil(dispose$),
      filter((e) => Is.manifestSelectorEvent(e, component)),
    );
    const action$ = rx.payload<A>($, 'sys.runtime.web/ManifestSelector/action');
    const current$ = rx.payload<C>($, 'sys.runtime.web/ManifestSelector/current');

    action$
      .pipe(
        filter((e) => e.kind === 'load:manifest'),
        map((e) => e.url),
      )
      .subscribe((url) => api.loadManifest(url));

    action$
      .pipe(
        filter((e) => e.kind === 'set:url'),
        map((e) => e.url),
      )
      .subscribe((url) => (api.manifestUrl = url));

    current$
      .pipe(
        distinctUntilChanged(
          (prev, next) => prev.manifest?.hash.module === next.manifest?.hash.module,
        ),
      )
      .subscribe(({ url, manifest }) => args.onChanged?.({ url, manifest }));

    return () => dispose$.next();
  }, [component]); // eslint-disable-line

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

        bus.fire({
          type: 'sys.runtime.web/ManifestSelector/loaded',
          payload: { component, url: url.href, manifest },
        });
      } catch (error: any) {
        setError(`Failed to parse URL`);
      }
    },
  };

  return api;
}
