import * as t from '@platform/types';
import { is } from '@platform/util.is';
import { Subject, Observable } from 'rxjs';
import { filter, takeWhile } from 'rxjs/operators';
import { isEvent } from './rx.event';
import { id } from '../id';

type E = t.Event;

type BusClone = <T extends E = E>(
  source: t.EventBus<any>,
  config?: BusCloneDuplex<T> | BusCloneDuplexConfig<T>,
) => t.EventBus<T>;
type BusClonePipe<T extends E> = ($: Observable<T>) => Observable<T>;
type BusCloneDuplex<T extends E> = BusClonePipe<T>; // NB: Same filter both ways.
type BusCloneDuplexConfig<T extends E> = { source: BusClonePipe<T>; target: BusClonePipe<T> };

type BusFactory = <T extends E = E>(input?: Subject<any> | t.EventBus<any>) => t.EventBus<T>;
type Bus = BusFactory & {
  isBus(input: any): boolean;
  asType<T extends E>(bus: t.EventBus<any>): t.EventBus<T>;
  instance(bus: t.EventBus<any>): string;
  clone: BusClone;
};

/**
 * Determine if the given object in an EventBus.
 */
export function isBus(input: any) {
  if (typeof input !== 'object' || input === null) return false;
  return is.observable(input.$) && typeof input.fire === 'function';
}

/**
 * Convert a bus of one type into another type.
 */
export function busAsType<T extends E>(bus: t.EventBus<any>) {
  return bus as t.EventBus<T>;
}

/**
 * Factory for creating an event-bus.
 */
const factory: BusFactory = <T extends E = E>(input?: Subject<any> | t.EventBus<any>) => {
  if (isBus(input)) return input as t.EventBus<T>;

  const subject$ = (input as Subject<any>) || new Subject<any>();

  const res: t.EventBus<T> = {
    $: subject$.pipe(filter((e) => isEvent(e))),
    fire: (e) => subject$.next(e),
  };

  (res as any)._instance = `bus.${id.slug()}`; // NB: An instance ID for debugging sanity.

  return res;
};

/**
 * Read the "_instance" hidden ID from the bus.
 */
function instance(bus: t.EventBus<any>) {
  return ((bus ?? {}) as any)._instance ?? '';
}

/**
 * Create a live clone of an event-bus.
 */
function clone<T extends E = E>(
  source: t.EventBus<any>,
  config?: BusCloneDuplex<T> | BusCloneDuplexConfig<T>,
): t.EventBus<T> {
  if (!isBus(source)) throw new Error('Input not an event-bus');

  // Create the target (child) bus.
  const targetSubject$ = new Subject<void>();
  const target = factory<T>(targetSubject$);
  (target as any)._instance = `${(source as any)._instance}/bus.${id.slug()}`;

  let source$ = source.$;
  let target$ = target.$;

  // Apply configuration filters.
  if (Boolean(config)) {
    if (typeof config === 'function') {
      source$ = config(source$);
      target$ = config(target$);
    }
    if (typeof config === 'object') {
      if (typeof config.source === 'function') source$ = config.source(source$);
      if (typeof config.target === 'function') target$ = config.target(target$);
    }
  }

  let isDisposed = false;
  let _ignoreSource: E | undefined; // NB: used to prevent firing loop between observables.
  let _ignoreTarget: E | undefined;

  const dispose = () => {
    isDisposed = true;
    targetSubject$.complete();
  };

  // Ferry events between [source:target]
  source$
    .pipe(
      filter((e) => e !== _ignoreTarget),
      takeWhile(() => !isDisposed),
    )
    .subscribe({
      next(e) {
        _ignoreSource = e;
        target.fire(e);
        _ignoreSource = undefined;
      },
      complete: () => dispose(),
    });

  target$
    .pipe(
      filter((e) => e !== _ignoreSource),
      takeWhile(() => !isDisposed),
    )
    .subscribe({
      next(e) {
        _ignoreTarget = e;
        source.fire(e);
        _ignoreTarget = undefined;
      },
      complete: () => dispose(),
    });

  // Finish up.
  return target;
}

/**
 * Export extended [bus] function.
 */
(factory as any).isBus = isBus;
(factory as any).asType = busAsType;
(factory as any).instance = instance;
(factory as any).clone = clone;
export const bus = factory as Bus;
