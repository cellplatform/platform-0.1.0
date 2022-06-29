import { useEffect, useState } from 'react';
import { filter, takeUntil } from 'rxjs/operators';

import { rx, t, time, Filesystem } from '../common';
import { Is } from '../Is';

type L = t.ManifestSelectorLoadedEvent;
type K = t.ManifestSelectorKeypressEvent;
type H = t.ManifestSelectoryHistory;

type InstanceId = string;
type FilesystemId = string;
type FilePath = string;

/**
 * State controller.
 */
export function useHistoryController(args: {
  bus: t.EventBus<any>;
  component: InstanceId;
  enabled?: boolean;
  fs: FilesystemId;
  path: FilePath;
}) {
  const { component, enabled = true, path } = args;
  const id = args.fs;
  const bus = rx.busAsType<t.ManifestSelectorEvent>(args.bus);

  const [ready, setReady] = useState(false);
  const [list, setList] = useState<H[]>([]);

  /**
   * Lifecycle
   */
  useEffect(() => {
    const store = Filesystem.Events({ bus, id });
    const fs = store.fs();
    let index = -1;

    const $ = bus.$.pipe(
      takeUntil(store.dispose$),
      filter((e) => enabled),
      filter((e) => Is.manifestSelectorEvent(e, component)),
    );
    const loaded$ = rx.payload<L>($, 'sys.runtime.web/ManifestSelector/loaded');
    const key$ = rx
      .payload<K>($, 'sys.runtime.web/ManifestSelector/keypress')
      .pipe(filter((e) => e.keypress.action === 'down'));
    const cursorUp$ = key$.pipe(filter((e) => e.keypress.key === 'ArrowUp'));
    const cursorDown$ = key$.pipe(filter((e) => e.keypress.key === 'ArrowDown'));

    const fireUrl = (url?: string) => {
      if (url) {
        bus.fire({
          type: 'sys.runtime.web/ManifestSelector/action',
          payload: { kind: 'set:url', component, url },
        });
      }
    };

    const getHistory = async () => {
      const list = (await fs.json.read<H[]>(path)) || [];
      setList(list);
      return list;
    };
    const appendHistory = async (url: t.ManifestUrl, version: H['version']) => {
      if (!enabled) return;
      const prev = (await getHistory()).filter((item) => item.url !== url);
      const next: H = { url, time: time.now.timestamp, version };
      const list: H[] = [...prev, next];
      await fs.json.write(path, list);
    };

    /**
     * Log a history item when a manifest loads for future reference.
     */
    loaded$.subscribe((e) => {
      appendHistory(e.url, e.manifest.module.version);
      index = -1; // Reset "selected index" history.
    });

    /**
     * Keypress: UP
     */
    cursorUp$.subscribe(async (e) => {
      e.keypress.cancel();
      let list = await getHistory();

      /**
       * TODO 🐷
       * - dropdown history UI (CMD + DOWN)
       */

      // If the last item is the same as the current URL remove it
      // so we don't load the existing value.
      const last = list[list.length - 1];
      if (last?.url === e.current.url) list = list.slice(0, list.length - 1);

      // Retrieve URL at previous index and load.
      index = Math.max(0, index === -1 ? list.length - 1 : index - 1);
      fireUrl(list[index]?.url);
    });

    /**
     * Keypress: DOWN
     */
    cursorDown$.subscribe(async (e) => {
      e.keypress.cancel();
      if (index < 0) return; // NB: Not within "selected index" history yet.

      // Retrieve URL at next index and load.
      const list = await getHistory();
      index = Math.min(list.length - 1, index === -1 ? 0 : index + 1);
      fireUrl(list[index]?.url);
    });

    /**
     * INIT: Start.
     */
    (async () => {
      await store.ready();
      await getHistory();
      setReady(true);
    })();

    return () => store.dispose();
  }, [component, id, enabled, path]); // eslint-disable-line

  /**
   * Public API
   */
  return { ready, enabled, list };
}
