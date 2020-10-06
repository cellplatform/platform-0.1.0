import { Observable } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { t, is } from '../common';

type O = Record<string, unknown>;
type Event = t.Event<any>;

/**
 * Factory for creating [state-object] mergers.
 */
export function create(factory: t.StateObject['create']) {
  /**
   * Merge multiple state-objects together to produce a
   * single synchronized state.
   */
  return <T extends { [key: string]: O }, E extends Event = any>(
    initial: T | Record<keyof T, t.IStateObject<T[keyof T]>>,
    dispose$?: Observable<any>,
  ): t.StateMerger<T, E> => {
    // Wrangle initial arg into a simple {inital} object.
    type S = t.IStateObject<T[keyof T]>;

    const initialStateObjects: { key: string; obj: S }[] = [];
    initial = Object.keys(initial).reduce((acc, key) => {
      const value = initial[key];
      if (is.stateObject(value)) {
        acc[key] = value.state;
        initialStateObjects.push({ key, obj: value as S });
      } else {
        acc[key] = value;
      }
      return acc;
    }, {}) as T;

    // Setup the store.
    const store = factory<T, E>(initial);
    if (dispose$) {
      dispose$.subscribe(() => api.dispose());
    }

    const change = (key: keyof T, to: any) => store.change((draft) => (draft[key] = to));

    const api: t.StateMerger<T, E> = {
      store,

      get state() {
        return store.state;
      },

      get changed$() {
        return store.event.changed$;
      },

      add<K extends keyof T>(
        key: K,
        subject: t.IStateObject<T[K]> | Observable<t.IStateObjectChanged>,
      ) {
        const isObservable = is.observable(subject);
        const changed$ = isObservable
          ? (subject as Observable<t.IStateObjectChanged>)
          : (subject as t.IStateObject<T[K]>).event.changed$;

        // Set initial key value, if a state object was passed.
        if (!isObservable) {
          const obj = subject as t.IStateObject<T[K]>;
          change(key, obj.state);
        }

        // Keep value in sync on change.
        changed$.pipe(takeUntil(store.dispose$)).subscribe((e) => change(key, e.to));

        return api;
      },

      dispose: () => store.dispose(),
    };

    initialStateObjects.forEach(({ key, obj }) => api.add(key, obj));
    return api;
  };
}
