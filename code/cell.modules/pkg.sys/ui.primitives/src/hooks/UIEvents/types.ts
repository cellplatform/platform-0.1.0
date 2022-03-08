import { Disposable, EventBus } from '@platform/types';
import {
  MouseEventHandler,
  TouchEventHandler,
  TouchList,
  FocusEventHandler,
  RefObject,
} from 'react';

import { Observable } from 'rxjs';

type O = Record<string, unknown>;
type H = HTMLElement;
type Id = string;

/**
 * Hook for abstracting a set of DOM events through an event-bus.
 */
export type UIEventsHook<T extends H = H> = {
  instance: Id;
  ref: RefObject<T>;
  mouse: UIEventsMouse<T>;
  touch: UIEventsTouch<T>;
  focus: UIEventsFocus<T>;
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

export type UIEventsFocus<T extends H = H> = {
  onFocus: FocusEventHandler<T>;
  onFocusCapture: FocusEventHandler<T>;
  onBlur: FocusEventHandler<T>;
  onBlurCapture: FocusEventHandler<T>;
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

export type UIEventTarget = {
  readonly containsFocus: boolean;
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
  focus: { $: Observable<UIFocus<Ctx>> };
};

/**
 * EVENT (Definitions)
 */
export type UIEvent<Ctx extends O = O> = UIMouseEvent<Ctx> | UITouchEvent<Ctx> | UIFocusEvent<Ctx>;

/**
 * https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent
 */
export type UIMouseEvent<Ctx extends O = O> = { type: 'sys.ui.event/Mouse'; payload: UIMouse<Ctx> };
export type UIMouse<Ctx extends O = O> = {
  readonly ctx: Ctx;
  readonly instance: Id;
  readonly kind: keyof UIEventsMouse;
  readonly mouse: UIMouseEventProps;
  readonly target: UIEventTarget;
};
export type UIMouseEventProps = UIEventBase &
  UIModifierKeys & {
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
export type UITouch<Ctx extends O = O> = {
  readonly ctx: Ctx;
  readonly instance: Id;
  readonly kind: keyof UIEventsTouch;
  readonly touch: UITouchEventProps;
  readonly target: UIEventTarget;
};
export type UITouchEventProps = UIEventBase &
  UIModifierKeys & {
    readonly targetTouches: TouchList;
    readonly changedTouches: TouchList;
    readonly touches: TouchList;
  };

/**
 * https://developer.mozilla.org/en-US/docs/Web/API/Element/focus_event
 * https://developer.mozilla.org/en-US/docs/Web/API/Element/blur_event
 */
export type UIFocusEvent<Ctx extends O = O> = { type: 'sys.ui.event/Focus'; payload: UIFocus<Ctx> };
export type UIFocus<Ctx extends O = O> = {
  readonly ctx: Ctx;
  readonly instance: Id;
  readonly kind: keyof UIEventsFocus;
  readonly focus: UIFocusEventProps;
  readonly isFocused: boolean;
  readonly isBlurred: boolean;
  readonly target: UIEventTarget;
};
export type UIFocusEventProps = UIEventBase;
