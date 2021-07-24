import { equals } from 'ramda';
import { animationFrameScheduler, Subject } from 'rxjs';
import { distinctUntilChanged, filter, map, observeOn, takeUntil } from 'rxjs/operators';

import * as t from '../common/types';

const RECT: t.DomRect = {
  x: -1,
  y: -1,
  width: -1,
  height: -1,
  top: -1,
  right: -1,
  bottom: -1,
  left: -1,
};
export const DEFAULT = { RECT };

/**
 * An observer that monitors the changing size of an HTML element.
 */
export const ResizeObserver = (el?: HTMLElement | null): t.ResizeObserver => {
  const root$ = new Subject<t.ResizeObserverEvent>();
  const dispose$ = new Subject<void>();

  type Item = { element: t.ResizeElementObserver; next(e: t.ResizeObserverEvent): void };
  let items: Item[] = [];
  const findByTarget = (el: HTMLElement) => items.find((item) => item.element.target === el);

  const createItem = (target: HTMLElement) => {
    const item$ = new Subject<t.ResizeObserverEvent>();
    const dispose$ = new Subject<void>();
    const dispose = () => {
      items = items.filter((item) => item.element.target !== target);
      item$.complete();
      dispose$.next();
      dispose$.complete();
      dom.unobserve(target);
    };
    api.dispose$.subscribe(() => dispose());

    let rect: t.DomRect = DEFAULT.RECT;
    const $ = item$.pipe(takeUntil(dispose$), observeOn(animationFrameScheduler));
    const element: t.ResizeElementObserver = {
      target,
      $,
      dispose$: dispose$.asObservable(),
      dispose,
      get rect() {
        return rect;
      },
    };
    const item: Item = { element, next: (e) => item$.next(e) };

    item$
      .pipe(
        filter((e) => e.type === 'ResizeObserver/size'),
        map((e) => e as t.ResizeObserverSizeEvent),
        distinctUntilChanged((prev, next) => equals(prev.payload.rect, next.payload.rect)),
      )
      .subscribe((e) => {
        rect = e.payload.rect;
        root$.next(e); // NB: Pipe into the root observable.
      });

    dom.observe(target);
    items.push(item);
    return item;
  };

  const dom = new (window as any).ResizeObserver((entries: any) => {
    entries.forEach((e: any) => {
      const target = e.target;
      const item = findByTarget(target);
      if (item) {
        const { x, y, width, height, top, right, bottom, left } = e.contentRect;
        item.next({
          type: 'ResizeObserver/size',
          payload: {
            target: e.target,
            rect: { x, y, width, height, top, right, bottom, left },
          },
        });
      }
    });
  });

  const api = {
    $: root$.pipe(takeUntil(dispose$)),
    dispose$: dispose$.asObservable(),

    get elements() {
      return items.map((item) => item.element);
    },

    dispose() {
      items.forEach((item) => item.element.dispose());
      dom.disconnect();
      dispose$.next();
      dispose$.complete();
    },

    watch(target: HTMLElement) {
      return findByTarget(target)?.element || createItem(target).element;
    },

    unwatch(target: HTMLElement) {
      findByTarget(target)?.element.dispose();
    },
  };

  if (el) api.watch(el);
  return api;
};
