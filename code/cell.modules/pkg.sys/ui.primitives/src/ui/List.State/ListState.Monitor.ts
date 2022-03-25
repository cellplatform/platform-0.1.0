import { Observable, Subject, takeUntil } from 'rxjs';

import { t } from '../common';
import { ListMouseMonitor } from './Mouse';
import { ListSelectionMonitor } from './Selection';

type ListStateMonitorArgs = t.ListBusArgs & {
  selection?: t.ListSelectionConfig;
  reset$?: Observable<any>;
  getCtx: () => t.ListStateCtx;
};

/**
 * Root level monitor for managing list state.
 */
export function ListStateMonitor(args: ListStateMonitorArgs) {
  const { bus, instance, getCtx } = args;

  const mouse = ListMouseMonitor({ bus, instance });
  const selection = ListSelectionMonitor({ bus, instance, getCtx, config: args.selection });

  const dispose$ = mouse.dispose$;
  const dispose = () => {
    mouse.dispose();
    selection.dispose();
  };

  const _changed$ = new Subject<t.ListStateChange>();
  const next = (e: t.ListStateChange) => _changed$.next(e);
  const changed$ = _changed$.pipe(takeUntil(dispose$));

  let _state: t.ListState = {};
  const setState = (fn: (prev: t.ListState) => t.ListState) => (_state = fn(_state));

  mouse.changed$.subscribe((e) => {
    setState((prev) => ({ ...prev, mouse: e.state }));
    next({ kind: 'Mouse', change: e });
  });

  selection.changed$.subscribe((e) => {
    setState((prev) => ({ ...prev, selection: e }));
    next({ kind: 'Selection', change: e });
  });

  const lazy: t.ListStateLazy = { changed$, get: () => _state };

  /**
   * API
   */
  return {
    dispose,
    dispose$,
    changed$,
    lazy,
    get current() {
      return _state;
    },
  };
}
