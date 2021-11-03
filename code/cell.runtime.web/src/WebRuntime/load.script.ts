import { Observable, Subject, firstValueFrom } from 'rxjs';
import { filter, takeUntil, map } from 'rxjs/operators';

import { log, t } from '../common';

export const Script = {
  /**
   * Determine if the given script has already been loaded.
   */
  exists(url: string) {
    return Boolean(findScriptElement(url));
  },

  /**
   * Dynmaically insert the <script> element of a remote entry.
   */
  load(args: {
    url: string; // Remote entry URL (eg ".../remoteEntry.js")
    namespace: string;
    dispose$?: Observable<any>;
    silent?: boolean;
  }): t.RuntimeRemoteScript {
    const { url, namespace } = args;

    const dispose$ = new Subject<void>();
    const event$ = new Subject<t.RuntimeWebScriptEvent>();
    const $ = event$.pipe(takeUntil(dispose$));

    args.dispose$?.subscribe(() => loader.dispose());
    dispose$.subscribe(() => {
      const script = findScriptElement(url);
      if (script) document.head.removeChild(script);
    });

    const next = (args: { ready: boolean; failed: boolean }) => {
      const { ready, failed } = args;
      event$.next({
        type: 'cell.runtime.web/script',
        payload: { url, namespace, ready, failed },
      });
    };

    const ready = firstValueFrom(
      $.pipe(
        filter((e) => e.type === 'cell.runtime.web/script'),
        filter((e) => e.payload.ready),
        map((e) => e.payload as t.RuntimeWebScript),
      ),
    );

    $.pipe(
      filter(() => !args.silent),
      filter((e) => e.type === 'cell.runtime.web/script'),
      map((e) => e.payload as t.RuntimeWebScript),
    ).subscribe((e) => {
      if (e.ready) log.info(`Loaded remote: ${e.namespace} | ${e.url}`);
      if (e.failed) log.error(`Failed to load remote: ${e.namespace} | ${e.url}`);
    });

    const existingScript = findScriptElement(url);

    if (existingScript) {
      // Already exists.
      // NB: Fire after tick to allow return value to happen before event is triggered.
      const ready = existingScript.dataset.ready === 'true';
      const failed = existingScript.dataset.failed === 'true';
      setTimeout(() => next({ ready, failed }), 0);
    }

    if (!existingScript) {
      // Insert script into DOM.
      const script = document.createElement('script');
      script.src = url;
      script.type = 'text/javascript';
      script.async = true;
      script.setAttribute('data-namespace', namespace);

      const update = (ready: boolean, failed: boolean) => {
        script.setAttribute('data-ready', ready.toString());
        script.setAttribute('data-failed', failed.toString());
        next({ ready, failed });
      };

      script.onload = () => update(true, false);
      script.onerror = () => update(false, true);

      next({ ready: false, failed: false });
      document.head.appendChild(script);
    }

    const loader: t.RuntimeRemoteScript = {
      ready,
      $,
      dispose$: dispose$.asObservable(),
      dispose: () => {
        dispose$.next();
        dispose$.complete();
      },
    };

    return loader;
  },
};

/**
 * [Helpers]
 */

const findScriptElement = (url: string) => {
  const scripts = document.getElementsByTagName('script');
  return Array.from(scripts).find((script) => script.src === url);
};
