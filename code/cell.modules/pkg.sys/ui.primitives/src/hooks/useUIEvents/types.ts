import { Disposable, EventBus } from '@platform/types';
import { MouseEventHandler, TouchEventHandler, TouchList } from 'react';
import { Observable } from 'rxjs';

type O = Record<string, unknown>;
type H = HTMLElement;
type Id = string;

/**
 * Hook for abstracting a set of DOM events through an event-bus.
 */
export type UIEventsHook<T extends H = H> = {
  instance: Id;
  mouse: UIEventsMouse<T>;
  touch: UIEventsTouch<T>;
};

export type UIEventsMouse<T extends H = H> = {
  onClick: MouseEventHandler<T>;
  onMouseDown: MouseEventHandler<T>;
  onMouseDownCapture: MouseEventHandler<T>;
  onMouseEnter: MouseEventHandler<T>;
  onMouseLeave: MouseEventHandler<T>;
  onMouseMove: MouseEventHandler<T>;
  onMouseMoveCapture: MouseEventHandler<T>;
  onMouseOut: MouseEventHandler<T>;
  onMouseOutCapture: MouseEventHandler<T>;
  onMouseOver: MouseEventHandler<T>;
  onMouseOverCapture: MouseEventHandler<T>;
  onMouseUp: MouseEventHandler<T>;
  onMouseUpCapture: MouseEventHandler<T>;
};

export type UIEventsTouch<T extends H = H> = {
  onTouchCancel: TouchEventHandler<T>;
  onTouchCancelCapture: TouchEventHandler<T>;
  onTouchEnd: TouchEventHandler<T>;
  onTouchEndCapture: TouchEventHandler<T>;
  onTouchMove: TouchEventHandler<T>;
  onTouchMoveCapture: TouchEventHandler<T>;
  onTouchStart: TouchEventHandler<T>;
  onTouchStartCapture: TouchEventHandler<T>;
  onTouchOut: TouchEventHandler<T>;
  onTouchOutCapture: TouchEventHandler<T>;
};

/**
 * Common
 */
export type UIEventBase = {
  readonly bubbles: boolean;
  readonly cancelable: boolean;
  readonly eventPhase: number;
  readonly timeStamp: number;
  readonly isTrusted: boolean;
  preventDefault(): void;
  stopPropagation(): void;
};

export type UIModifierKeys = {
  readonly altKey: boolean;
  readonly ctrlKey: boolean;
  readonly metaKey: boolean;
  readonly shiftKey: boolean;
};

/**
 * EVENT (API)
 */
export type UIEventsFactory = (args: { bus: EventBus<any>; instance: Id }) => UIEvents;
export type UIEvents<Ctx extends O = O> = Disposable & {
  instance: Id;
  $: Observable<UIEvent>;
  mouse: { $: Observable<UIMouse<Ctx>> };
  touch: { $: Observable<UITouch<Ctx>> };
};

/**
 * EVENT (Definitions)
 */
export type UIEvent = UIMouseEvent | UITouchEvent;

/**
 * https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent
 */
export type UIMouseEvent<Ctx extends O = O> = { type: 'sys.ui.event/Mouse'; payload: UIMouse<Ctx> };
export type UIMouse<Ctx extends O = O> = { instance: Id; ctx: Ctx; mouse: UIMouseEventProps };
export type UIMouseEventProps = UIEventBase &
  UIModifierKeys & {
    readonly kind: keyof UIEventsMouse;
    readonly button: number;
    readonly buttons: number;
    readonly client: { x: number; y: number };
    readonly movement: { x: number; y: number };
    readonly page: { x: number; y: number };
    readonly screen: { x: number; y: number };
  };

/**
 * https://developer.mozilla.org/en-US/docs/Web/API/TouchEvent
 */
export type UITouchEvent<Ctx extends O = O> = { type: 'sys.ui.event/Touch'; payload: UITouch<Ctx> };
export type UITouch<Ctx extends O = O> = { instance: Id; ctx: Ctx; touch: UITouchEventProps };
export type UITouchEventProps = UIEventBase &
  UIModifierKeys & {
    readonly kind: keyof UIEventsTouch;
    readonly targetTouches: TouchList;
    readonly changedTouches: TouchList;
    readonly touches: TouchList;
  };
