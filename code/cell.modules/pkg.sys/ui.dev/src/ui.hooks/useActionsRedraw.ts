import { useEffect, useState } from 'react';
import { Subject } from 'rxjs';
import { filter, takeUntil, throttleTime, debounceTime } from 'rxjs/operators';

import { t, rx } from '../common';

type Path = 'initialized' | 'ctx/current' | 'env/viaAction' | 'env/viaSubject' | 'items';
type PathMatch = (path: string) => boolean;

/**
 * Causes a redraw of a component when the state of the Action model changes.
 */
export function useActionsRedraw(args: {
  name?: string;
  bus: t.EventBus;
  paths: (Path | PathMatch)[];
  actions?: t.Actions<any>;
  throttle?: number;
}) {
  const { actions } = args;
  const [, setRedraw] = useState<number>(0);
  const bus = args.bus as t.EventBus<t.ActionEvent>;

  useEffect(() => {
    const { dispose$, dispose } = rx.disposable();

    if (actions) {
      const model = actions.toModel();
      const ns = model.state.namespace;
      const changed$ = model.event.changed$;

      const redraw = () => setRedraw((prev) => prev + 1);

      // Redraw when explicitly invoked.
      model.state.redraw$
        .pipe(takeUntil(dispose$), throttleTime(args.throttle ?? 0), debounceTime(10))
        .subscribe(redraw);

      // Redraw when specific model path has changed.
      changed$
        .pipe(
          takeUntil(dispose$),
          filter((e) => e.to.namespace === ns),
          filter((e) => isChangedPath(args.paths, e.patches)),
          throttleTime(args.throttle ?? 0),
          debounceTime(0),
        )
        .subscribe(redraw);
    }

    return dispose;
  }, [bus, actions]); // eslint-disable-line
}

/**
 * [Helpers]
 */

function isChangedPath(paths: (string | PathMatch)[], patches: t.PatchSet) {
  return patches.next.some((patch) => {
    return paths.some((path) => {
      if (typeof path === 'function') return path(patch.path);
      return patch.path === path || patch.path.startsWith(`${path}/`);
    });
  });
}
