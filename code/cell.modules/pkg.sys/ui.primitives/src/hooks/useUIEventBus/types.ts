import { MouseEventHandler, TouchEventHandler, TouchList } from 'react';

type H = HTMLElement;
type Id = string;

/**
 * Hook for abstracting a set of DOM events through an event-bus.
 */
export type UIEventBusHook<T extends H = H> = {
  instance: Id;
  namespace: string;
  mouse: UIEventBusMouse<T>;
  touch: UIEventBusTouch<T>;
};

export type UIEventBusMouse<T extends H = H> = {
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

export type UIEventBusTouch<T extends H = H> = {
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
 * Events
 */
export type UIEventPayload = UIMouse | UITouch;

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
 * https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent
 */
export type UIMouse = UIEventBase &
  UIModifierKeys & {
    readonly instance: Id;
    readonly kind: keyof UIEventBusMouse;
    readonly button: number;
    readonly buttons: number;
    readonly client: { x: number; y: number };
    readonly movement: { x: number; y: number };
    readonly page: { x: number; y: number };
    readonly screen: { x: number; y: number };
  };

export type UITouch = UIEventBase &
  UIModifierKeys & {
    readonly instance: Id;
    readonly kind: keyof UIEventBusTouch;
    readonly targetTouches: TouchList;
    readonly changedTouches: TouchList;
    readonly touches: TouchList;
  };
