import { Observable, Subject, takeUntil } from 'rxjs';

import { t, rx } from './common';
import { ListMouseMonitor } from './Mouse';
import { ListSelectionMonitor } from './Selection';

type ListStateMonitorArgs = {
  instance: t.ListInstance;
  selection?: t.ListSelectionConfig;
  reset$?: Observable<any>;
  initial?: t.ListState; // Initial state.
  getCtx: () => t.ListStateCtx;
};

/**
 * Root level monitor for managing list state.
 */
export function ListStateMonitor(args: ListStateMonitorArgs) {
  const { instance, getCtx } = args;
  const { id } = instance;
  const bus = rx.busAsType<t.ListEvent>(instance.bus);

  const mouse = ListMouseMonitor({ instance });
  const selection = ListSelectionMonitor({ instance, getCtx, config: args.selection });

  const dispose$ = mouse.dispose$;
  const dispose = () => {
    mouse.dispose();
    selection.dispose();
  };

  const _changed$ = new Subject<t.ListStateChange>();
  const next = (e: t.ListStateChange) => _changed$.next(e);
  const changed$ = _changed$.pipe(takeUntil(dispose$));

  let _state: t.ListState = args.initial ?? {};

  const setState = (kind: t.ListStateChange['kind'], fn: (prev: t.ListState) => t.ListState) => {
    const from = { ..._state };
    const to = (_state = fn(from));
    bus.fire({
      type: 'sys.ui.List/State:changed',
      payload: { instance: id, kind, from, to },
    });
  };

  mouse.changed$.subscribe((e) => {
    setState('Mouse', (prev) => ({ ...prev, mouse: e.state }));
    next({ kind: 'Mouse', change: e });
  });

  selection.changed$.subscribe((e) => {
    setState('Selection', (prev) => ({ ...prev, selection: e }));
    next({ kind: 'Selection', change: e });
  });

  const lazy: t.ListStateLazy = {
    changed$,
    get: () => _state,
    selection: args.selection,
  };

  /**
   * API
   */
  return {
    instance: { bus: rx.bus.instance(bus), id },
    dispose,
    dispose$,
    changed$,
    lazy,
    get current() {
      return _state;
    },
  };
}
