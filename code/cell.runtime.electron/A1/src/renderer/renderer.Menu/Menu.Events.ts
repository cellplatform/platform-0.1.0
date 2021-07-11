import { firstValueFrom, of } from 'rxjs';
import { filter, takeUntil, timeout, catchError } from 'rxjs/operators';

import { rx, slug, t, Patch } from '../common';
import { MenuTree } from './util';

/**
 * Event API.
 */
export function Events(args: { bus: t.EventBus<any> }): t.MenuEvents {
  const { dispose, dispose$ } = rx.disposable();
  const bus = rx.busAsType<t.MenuEvent>(args.bus);
  const is = Events.is;

  const $ = bus.$.pipe(
    takeUntil(dispose$),
    filter((e) => is.base(e)),
  );

  const status: t.MenuEvents['status'] = {
    req$: rx.payload<t.MenuStatusReqEvent>($, 'runtime.electron/Menu/status:req'),
    res$: rx.payload<t.MenuStatusResEvent>($, 'runtime.electron/Menu/status:res'),
    async get(options = {}) {
      const { timeout: msecs = 1000 } = options;

      const tx = slug();
      const first = firstValueFrom(
        status.res$.pipe(
          filter((e) => e.tx === tx),
          timeout(msecs),
          catchError(() => of(`Menu status request timed out after ${msecs} msecs`)),
        ),
      );

      bus.fire({
        type: 'runtime.electron/Menu/status:req',
        payload: { tx },
      });

      const res = await first;
      return typeof res === 'string' ? { tx, menu: [], error: res } : res;
    },
  };

  const load: t.MenuEvents['load'] = {
    req$: rx.payload<t.MenuLoadReqEvent>($, 'runtime.electron/Menu/load:req'),
    res$: rx.payload<t.MenuLoadResEvent>($, 'runtime.electron/Menu/load:res'),
    async fire(menu, options = {}) {
      const { timeout: msecs = 1000 } = options;
      const tx = slug();

      const first = firstValueFrom(
        load.res$.pipe(
          filter((e) => e.tx === tx),
          timeout(msecs),
          catchError(() => of(`Menu load timed out after ${msecs} msecs`)),
        ),
      );

      bus.fire({
        type: 'runtime.electron/Menu/load:req',
        payload: { tx, menu },
      });

      const res = await first;
      return typeof res === 'string' ? { tx, menu: [], error: res, elapsed: msecs } : res;
    },
  };

  const clicked: t.MenuEvents['clicked'] = {
    $: rx.payload<t.MenuItemClickedEvent>($, 'runtime.electron/Menu/clicked'),
    fire(item: t.MenuItem, parent?: t.MenuItem) {
      const { id = '' } = item;
      bus.fire({
        type: 'runtime.electron/Menu/clicked',
        payload: { id, item, parent },
      });
    },
  };

  const patch: t.MenuEvents['patch'] = {
    req$: rx.payload<t.MenuPatchReqEvent>($, 'runtime.electron/Menu/patch:req'),
    res$: rx.payload<t.MenuPatchResEvent>($, 'runtime.electron/Menu/patch:res'),
    async fire(args) {
      const { id, patches, timeout: msecs = 1000 } = args;
      const tx = slug();

      const first = firstValueFrom(
        patch.res$.pipe(
          filter((e) => e.tx === tx),
          timeout(msecs),
          catchError(() => of(`Patch update timed out after ${msecs} msecs`)),
        ),
      );

      bus.fire({
        type: 'runtime.electron/Menu/patch:req',
        payload: { tx, id, patches, timeout: msecs },
      });

      const res = await first;
      return typeof res === 'string' ? { tx, id, menu: [], error: res, elapsed: msecs } : res;
    },
  };

  const change: t.MenuEvents['change'] = async <M extends t.MenuItem = t.MenuItemNormal>(
    id: t.MenuId,
    handler: t.MenuTypeChangeHandler<M>,
    options: { timeout?: number } = {},
  ) => {
    const { timeout } = options;

    const fail = (error: string) => done({ error });
    const done = (options: { menu?: t.Menu; error?: string } = {}): t.MenuChangeRes => {
      const { error, menu = [] } = options;
      return { id, menu, error };
    };

    // Retrieve the sub-menu item to operate on.
    const root = (await status.get()).menu;
    const menu = MenuTree(root).find((e) => e.id === id);
    if (!menu) return fail(`Menu with id '${id}' not found.`);

    // Run the change handler to produce a set of patches.
    const patches = (await Patch.changeAsync(menu, (draft) => handler(draft as M))).patches;
    const res = await patch.fire({ id, patches, timeout });
    return done(res);
  };

  return { $, is, dispose, dispose$, status, load, clicked, patch, change };
}

/**
 * Event matching.
 */
const matcher = (startsWith: string) => (input: any) => rx.isEvent(input, { startsWith });
Events.is = {
  base: matcher('runtime.electron/Menu/'),
};
