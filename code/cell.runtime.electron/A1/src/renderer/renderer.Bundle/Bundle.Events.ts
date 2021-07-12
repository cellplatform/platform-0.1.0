import { firstValueFrom, of } from 'rxjs';
import { filter, takeUntil, timeout, catchError } from 'rxjs/operators';
import { rx, slug, t } from '../common';

type Uri = string;

/**
 * Event API.
 */
export function Events(args: { bus: t.EventBus<any> }): t.BundleEvents {
  const { dispose, dispose$ } = rx.disposable();
  const bus = rx.busAsType<t.BundleEvent>(args.bus);
  const is = Events.is;

  const $ = bus.$.pipe(
    takeUntil(dispose$),
    filter((e) => is.base(e)),
  );

  const install: t.BundleEvents['install'] = {
    req$: rx.payload<t.BundleInstallReqEvent>($, 'runtime.electron/Bundle/install:req'),
    res$: rx.payload<t.BundleInstallResEvent>($, 'runtime.electron/Bundle/install:res'),
    async fire(source, options = {}) {
      const tx = slug();
      const { force, timeout: msecs = 3000, silent } = options;
      const first = firstValueFrom(
        install.res$.pipe(
          filter((e) => e.tx === tx),
          timeout(msecs),
          catchError(() => of(`Installation timed out after ${msecs} msecs`)),
        ),
      );

      bus.fire({
        type: 'runtime.electron/Bundle/install:req',
        payload: { tx, source, force, silent, timeout: msecs },
      });

      const res = await first;
      return typeof res === 'string'
        ? { tx, ok: false, action: 'error', source, errors: [res], elapsed: -1 }
        : res;
    },
  };

  const list: t.BundleEvents['list'] = {
    req$: rx.payload<t.BundleListReqEvent>($, 'runtime.electron/Bundle/list:req'),
    res$: rx.payload<t.BundleListResEvent>($, 'runtime.electron/Bundle/list:res'),
    async get(options = {}) {
      const { domain } = options;
      const tx = slug();
      const msecs = options.timeout ?? 1000;
      const first = firstValueFrom(
        list.res$.pipe(
          filter((e) => e.tx === tx),
          timeout(msecs),
          catchError(() => of(`Bundle listing timed out after ${msecs} msecs`)),
        ),
      );

      bus.fire({
        type: 'runtime.electron/Bundle/list:req',
        payload: { tx, domain },
      });

      const res = await first;
      return typeof res === 'string' ? { items: [], error: res } : res;
    },
  };

  const status: t.BundleEvents['status'] = {
    req$: rx.payload<t.BundleStatusReqEvent>($, 'runtime.electron/Bundle/status:req'),
    res$: rx.payload<t.BundleStatusResEvent>($, 'runtime.electron/Bundle/status:res'),
    async get(args) {
      const { domain, namespace, version, timeout: msecs = 1000 } = args;
      const tx = slug();
      const first = firstValueFrom(
        status.res$.pipe(
          filter((e) => e.tx === tx),
          timeout(msecs),
          catchError(() => {
            const ver = version ? `@${version}` : '';
            const context = `${domain}/${namespace}${ver}`;
            return of(`Status request [${context}] timed out after ${msecs} msecs`);
          }),
        ),
      );
      bus.fire({
        type: 'runtime.electron/Bundle/status:req',
        payload: { tx, domain, namespace, version },
      });

      const res = await first;
      return typeof res === 'string' ? { tx, exists: false, error: res } : res;
    },
  };

  return { $, is, dispose, dispose$, list, install, status };
}

/**
 * Event matching.
 */
const matcher = (startsWith: string) => (input: any) => rx.isEvent(input, { startsWith });
Events.is = {
  base: matcher('runtime.electron/Bundle/'),
};
