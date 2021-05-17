import { fromEvent as rxFromEvent, Observable, Subject } from 'rxjs';
import { is } from '@platform/util.is';

/**
 * Create observable from event.
 */
export const fromEvent = <T>(
  source: HTMLElement | Document | Window | undefined,
  event: string,
): Observable<T> => {
  return source ? rxFromEvent(source as any, event) : new Subject<any>().asObservable(); // NB: Safe when server-rendered.
};

/**
 * Create from document event.
 */
export const fromDocumentEvent = <T>(event: string): Observable<T> =>
  fromEvent(is.browser ? document : undefined, event);

/**
 * Create from window event.
 */
export const fromWindowEvent = <T>(event: string): Observable<T> =>
  fromEvent(is.browser ? window : undefined, event);
