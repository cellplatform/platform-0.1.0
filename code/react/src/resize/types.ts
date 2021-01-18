import { Observable } from 'rxjs';

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

export type ResizeObserver = {
  readonly $: Observable<ResizeObserverEvent>;
  readonly elements: ResizeElementObserver[];
  dispose(): void;
  watch(target: HTMLElement): ResizeElementObserver;
  unwatch(target: HTMLElement): void;
};

export type ResizeElementObserver = {
  readonly $: Observable<ResizeObserverEvent>;
  readonly target: HTMLElement;
  readonly rect: DomRect;
  dispose(): void;
};

/**
 * Events
 */
export type ResizeObserverEvent = ResizeObserverSizeEvent;

export type ResizeObserverSizeEvent = {
  type: 'ResizeObserver/size';
  payload: ResizeObserverSize;
};
export type ResizeObserverSize = { rect: DomRect; target: HTMLElement };
