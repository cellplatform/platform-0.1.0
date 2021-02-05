import { useEffect, useState } from 'react';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

import { t } from '../../common';

type Path = 'initialized' | 'ctx/current' | 'env/viaAction' | 'env/viaSubject' | 'items';

/**
 * Causes a redraw of a component when the state of the Action model changes.
 */
export function useRedraw(args: {
  name?: string;
  bus: t.DevEventBus;
  actions?: t.DevActions<any>;
  paths: Path[];
}) {
  const { bus, actions } = args;
  const [redraw, setRedraw] = useState<number>(0);

  useEffect(() => {
    const dispose$ = new Subject<void>();

    if (actions) {
      const model = actions.toModel();
      const ns = model.state.ns;
      const changed$ = model.event.changed$;

      changed$
        .pipe(
          takeUntil(dispose$),
          filter((e) => e.to.ns === ns),
          filter((e) => isChangedPath(args.paths, e.patches)),
        )
        .subscribe(() => {
          setRedraw((prev) => prev + 1);
        });
    }

    return () => dispose$.next();
  }, [bus, actions]); // eslint-disable-line
}

/**
 * [Helpers]
 */

function isChangedPath(paths: string[], patches: t.PatchSet) {
  return patches.next.some((patch) => {
    return paths.some((path) => {
      return patch.path === path || patch.path.startsWith(`${path}/`);
    });
  });
}
