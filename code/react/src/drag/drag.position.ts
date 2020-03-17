import { Observable, Subject } from 'rxjs';
import { map, share, takeUntil } from 'rxjs/operators';

import { events } from '../events';
import { DragPosition, IDragPositionEvent } from './types';

const EMPTY = { x: -1, y: -1 };

export class DragPositionEvent implements IDragPositionEvent {
  public type: IDragPositionEvent['type'];
  public start: DragPosition;

  private el: HTMLElement;
  private event: events.IMouseEvent;

  constructor(options: {
    type: DragPositionEvent['type'];
    el: HTMLElement;
    event: events.IMouseEvent;
    start: DragPosition;
  }) {
    const { type, el, event, start } = options;
    this.type = type;
    this.el = el;
    this.event = event;
    this.start = start;
  }

  public get client() {
    const { clientX: x, clientY: y } = this.event;
    return { x, y };
  }

  public get screen() {
    const { screenX: x, screenY: y } = this.event;
    return { x, y };
  }

  public get delta() {
    const start = this.start || EMPTY;
    const { screenX, screenY } = this.event;
    const x = screenX - start.x;
    const y = screenY - start.y;
    return { x, y };
  }

  public get element() {
    const position = offsetPosition(this.el);
    const { clientX, clientY } = this.event;
    return { x: clientX - position.left, y: clientY - position.top };
  }

  public toObject(): IDragPositionEvent {
    return {
      type: this.type,
      client: this.client,
      screen: this.screen,
      element: this.element,
      delta: this.delta,
      start: this.start,
    };
  }

  public clone(type: DragPositionEvent['type']) {
    return new DragPositionEvent({
      type,
      el: this.el,
      event: this.event,
      start: this.start,
    });
  }
}

/**
 * Starts a drag operation (usually initiated from a mouse-down event.)
 */
export const position = (options: { el: HTMLElement }) => {
  const dispose$ = new Subject();
  const events$ = new Subject<DragPositionEvent>();
  const mouseUp$ = events.mouseUp$.pipe(takeUntil(dispose$));
  const el = options.el;
  let start: DragPosition;
  let prev: DragPositionEvent;

  const move$: Observable<DragPositionEvent> = events.mouseMove$.pipe(
    takeUntil(dispose$),
    map(e => {
      if (!start) {
        start = { x: e.screenX, y: e.screenY };
      }
      prev = new DragPositionEvent({
        type: 'DRAG',
        el,
        event: e,
        start,
      });
      return prev;
    }),
    takeUntil(mouseUp$),
  );

  move$.subscribe(e => events$.next(e));
  mouseUp$.subscribe(e => {
    const arg = prev
      ? prev.clone('COMPLETE')
      : new DragPositionEvent({
          type: 'COMPLETE',
          el,
          event: e,
          start,
        });
    events$.next(arg);
    api.dispose();
  });

  const api = {
    isComplete: false,
    events$: events$.pipe(share()),
    dispose$: dispose$.pipe(share()),
    dispose: () => {
      dispose$.next();
      dispose$.complete();
      api.isComplete = true;
    },
  };

  return api;
};

/**
 * [Internal]
 * Source: https://plainjs.com/javascript/styles/get-the-position-of-an-element-relative-to-the-document-24/
 */
export const offsetPosition = (el: HTMLElement) => {
  const rect = el.getBoundingClientRect();
  const doc = document.documentElement ? document.documentElement : undefined;
  const scrollLeft = window.pageXOffset || (doc ? doc.scrollLeft : 0);
  const scrollTop = window.pageYOffset || (doc ? doc.scrollTop : 0);
  return { top: rect.top + scrollTop, left: rect.left + scrollLeft };
};
