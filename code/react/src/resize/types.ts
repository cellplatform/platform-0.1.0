import { Observable } from 'rxjs';
import { IDisposable } from '@platform/types';

/**
 * Size and position of a rectangle.
 * https://developer.mozilla.org/en-US/docs/Web/API/DOMRect
 */
export type DomRect = {
  x: number;
  y: number;
  width: number;
  height: number;
  top: number;
  right: number;
  bottom: number;
  left: number;
};

/**
 * Programmatic wrapper around the W3C [ResizeObserver] object.
 */
export type ResizeObserver = IDisposable & {
  readonly $: Observable<ResizeObserverEvent>;
  readonly elements: ResizeElementObserver[];
  watch(target: HTMLElement): ResizeElementObserver;
  unwatch(target: HTMLElement): void;
};

export type ResizeElementObserver = IDisposable & {
  readonly $: Observable<ResizeObserverEvent>;
  readonly target: HTMLElement;
  readonly rect: DomRect;
  dispose(): void;
};

/**
 * Events
 */
export type ResizeObserverEvent = ResizeObserverSizeEvent;

export type ResizeObserverSizeEvent = { type: 'ResizeObserver/size'; payload: ResizeObserverSize };
export type ResizeObserverSize = { rect: DomRect; target: HTMLElement };
