import { BehaviorSubject, Observable } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';

import { EventHistoryMonitor } from '../Event.History';
import { t } from './common';
import { CmdBarEvents } from './Events';
import { Util } from './Util';

type S = t.CmdBarState;

/**
 * State controller for the <CmdBar>.
 */
export function CmdBarStateController(args: {
  instance: t.CmdBarInstance;
  bus?: t.EventBus<any>;
  initial?: t.CmdBarState;
  logHistory?: boolean;
  dispose$?: Observable<any>;
}) {
  const { instance, bus, logHistory = true } = args;
  const events = CmdBarEvents({ instance, dispose$: args.dispose$ });
  const { dispose, dispose$ } = events;

  /**
   * State.
   */
  let _state: t.CmdBarState = args.initial ?? Util.defaultState();
  const state$ = new BehaviorSubject<t.CmdBarState>(_state);
  const change = (fn: (prev: S) => S) => {
    _state = fn(_state);
    state$.next(_state);
  };

  /**
   * Event history monitor.
   */
  if (bus && logHistory) {
    const monitor = EventHistoryMonitor(bus, { dispose$ });
    monitor.changed$.pipe(debounceTime(50)).subscribe((history) => {
      change((prev) => ({ ...prev, history }));
    });
  }

  /**
   * Text change monitor.
   */
  events.text.changed$.subscribe((e) => {
    change((prev) => ({ ...prev, text: e.to }));
  });

  /**
   * API
   */
  const api = {
    dispose$,
    dispose,
    state$: state$.pipe(takeUntil(dispose$)),
    get state() {
      return _state;
    },
  };
  return api;
}
