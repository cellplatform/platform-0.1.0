import { Subject } from 'rxjs';
import { filter, map, share, takeUntil } from 'rxjs/operators';

import * as t from './types';

/**
 * Generates a object containing read/write properties
 * with a corresponding observable events.
 */
export function observable<P extends t.IProps>(
  initial?: P | Array<keyof P>,
): t.IObservableProps<P> {
  const getInitial = () => {
    if (Array.isArray(initial)) {
      return initial.reduce((acc, next) => {
        acc[next.toString()] = undefined;
        return acc;
      }, {});
    } else {
      return initial || {};
    }
  };

  // Setup initial conditions.
  const values: any = { ...getInitial() };
  const keys = Object.keys(values);

  // Observables.
  const dispose$ = new Subject();
  const _events$ = new Subject<t.PropEvent>();
  const events$ = _events$.pipe(
    takeUntil(dispose$),
    share(),
  );

  const obj = {
    $: {
      dispose$: dispose$.pipe(share()),
      events$,

      getting$: events$.pipe(
        filter(e => e.type === 'PROP/getting'),
        map(e => e.payload as t.IPropGetting),
      ),
      get$: events$.pipe(
        filter(e => e.type === 'PROP/get'),
        map(e => e.payload as t.IPropGet),
      ),
      setting$: events$.pipe(
        filter(e => e.type === 'PROP/setting'),
        map(e => e.payload as t.IPropSetting),
      ),
      set$: events$.pipe(
        filter(e => e.type === 'PROP/set'),
        map(e => e.payload as t.IPropSet),
      ),
    },

    get isDisposed() {
      return dispose$.isStopped;
    },
    dispose() {
      dispose$.next();
      dispose$.complete();
    },
  };

  // Define property handlers.
  keys.forEach(key => {
    Object.defineProperty(obj, key, {
      /**
       * [GET] property value.
       */
      get() {
        const current = values[key];
        let result: P[keyof P] = current;
        let isModified = false;

        // Fire events.
        const before: t.IPropGetting<P> = {
          key,
          get value() {
            return current;
          },
          get isModified() {
            return isModified;
          },
          modify(value: P[keyof P]) {
            result = value;
            isModified = true;
          },
        };
        _events$.next({ type: 'PROP/getting', payload: before });
        _events$.next({ type: 'PROP/get', payload: { key, value: result } });

        // Finish up.
        return result;
      },

      /**
       * [SET] property value.
       */
      set(to: any) {
        const from = values[key];
        const value = { from, to };
        let isCancelled = false;

        const before: t.IPropSetting<P> = {
          key,
          value,
          get isCancelled() {
            return isCancelled;
          },
          cancel() {
            isCancelled = true;
          },
        };
        _events$.next({ type: 'PROP/setting', payload: before });

        if (isCancelled) {
          return;
        }

        values[key] = to;
        _events$.next({ type: 'PROP/set', payload: { key, value } });
      },
    });
  });

  // Finish up.
  return obj as t.IObservableProps<P>;
}
