import { useEffect, useState } from 'react';

import { Observable, Subject, BehaviorSubject, firstValueFrom, timeout, of, interval } from 'rxjs';
import {
  takeUntil,
  take,
  takeWhile,
  map,
  filter,
  share,
  delay,
  distinctUntilChanged,
  debounceTime,
  tap,
  catchError,
} from 'rxjs/operators';

import { t, rx, Is } from '../common';

type Id = string;
type Args = { bus: t.EventBus<any>; instance: Id };

type ListSelection = {
  indexes: number[];
};

/**
 * Selection monitor (hook)
 */
export function useSelection(args: Args) {
  const { bus, instance } = args;
  const [selection, setSelection] = useState<ListSelection>({ indexes: [] });

  /**
   * [Lifecycle]
   */
  useEffect(() => {
    const monitor = SelectionMonitor({ bus, instance });
    monitor.changed$.subscribe((e) => setSelection(e));
    return () => monitor.dispose();
  }, [bus, instance]);

  /**
   * API
   */
  return { instance, selection };
}

/**
 * Selection monitor
 */
export function SelectionMonitor(args: Args) {
  const { instance } = args;

  const changed$ = new Subject<ListSelection>();
  const dispose$ = new Subject<void>();
  const dispose = () => dispose$.next();

  const bus = rx.busAsType<t.ListEvent>(args.bus);
  const $ = bus.$.pipe(
    takeUntil(dispose$),
    filter((e) => Is.listEvent(e)),
    filter((e) => e.payload.instance === instance),
  );

  $.subscribe((e) => {
    console.log(' >>> ', e);
  });

  /**
   * API
   */
  return { changed$, dispose$, dispose };
}
