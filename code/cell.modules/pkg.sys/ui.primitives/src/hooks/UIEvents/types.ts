import { Disposable } from '@platform/types';
import {
  FocusEventHandler,
  MouseEventHandler,
  RefObject,
  TouchEventHandler,
  TouchList,
} from 'react';
import { Observable } from 'rxjs';

type O = Record<string, unknown>;
type H = HTMLElement;
type Id = string;

/**
 * Hook for abstracting a set of DOM events through an event-bus.
 */
export type UIEventPipeHook<Ctx extends O, T extends H = H> = {
  bus: Id;
  instance: Id;
  ref: RefObject<T>;
  readonly element: UIEventPipeElement<T>;
  readonly mouse: UIEventPipeMouse<T>;
  readonly touch: UIEventPipeTouch<T>;
  readonly focus: UIEventPipeFocus<T>;
  events(args?: { dispose$?: Observable<any>; filter?: UIEventFilter<Ctx> }): UIEvents<Ctx>;
};

export type UIEventFilter<Ctx extends O> = (e: UIEvent<Ctx>) => boolean;

export type UIEventPipeElement<T extends H> = {
  ref: RefObject<T>;
  readonly containsFocus: boolean;
  readonly withinFocus: boolean;
};

/**
 * Event Handler methods.
 */
export type UIEventPipeMouse<T extends H = H> = {
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

export type UIEventPipeTouch<T extends H = H> = {
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

export type UIEventPipeFocus<T extends H = H> = {
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
 * EVENTS (API)
 */
export type UIEvents<Ctx extends O = O> = Disposable & {
  instance: Id;
  $: Observable<UIEvent>;
  mouse: UIEventsMouse<Ctx>;
  touch: UIEventsTouch<Ctx>;
  focus: UIEventsFocus<Ctx>;
};

export type UIEventsMouse<Ctx extends O> = {
  $: Observable<UIMouse<Ctx>>;
  event(name: keyof UIEventPipeMouse): Observable<UIMouse<Ctx>>;
};

export type UIEventsTouch<Ctx extends O> = {
  $: Observable<UITouch<Ctx>>;
  event(name: keyof UIEventPipeTouch): Observable<UITouch<Ctx>>;
};

export type UIEventsFocus<Ctx extends O> = {
  $: Observable<UIFocus<Ctx>>;
  event(name: keyof UIEventPipeFocus): Observable<UIFocus<Ctx>>;
};

/**
 * EVENT (Definitions)
 */
export type UIEvent<Ctx extends O = O> = UIMouseEvent<Ctx> | UITouchEvent<Ctx> | UIFocusEvent<Ctx>;

/**
 * https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent
 */
export type UIMouseEvent<Ctx extends O = O> = {
  type: 'sys.ui.event/Mouse';
  payload: UIMouse<Ctx>;
};
export type UIMouse<Ctx extends O = O> = {
  readonly ctx: Ctx;
  readonly instance: Id;
  readonly name: keyof UIEventPipeMouse;
  readonly mouse: UIMouseProps;
  readonly target: UIEventTarget;
};
export type UIMouseProps = UIEventBase &
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
export type UITouchEvent<Ctx extends O = O> = {
  type: 'sys.ui.event/Touch';
  payload: UITouch<Ctx>;
};
export type UITouch<Ctx extends O = O> = {
  readonly ctx: Ctx;
  readonly instance: Id;
  readonly name: keyof UIEventPipeTouch;
  readonly touch: UITouchProps;
  readonly target: UIEventTarget;
};
export type UITouchProps = UIEventBase &
  UIModifierKeys & {
    readonly targetTouches: TouchList;
    readonly changedTouches: TouchList;
    readonly touches: TouchList;
  };

/**
 * https://developer.mozilla.org/en-US/docs/Web/API/Element/focus_event
 * https://developer.mozilla.org/en-US/docs/Web/API/Element/blur_event
 */
export type UIFocusEvent<Ctx extends O = O> = {
  type: 'sys.ui.event/Focus';
  payload: UIFocus<Ctx>;
};
export type UIFocus<Ctx extends O = O> = {
  readonly ctx: Ctx;
  readonly instance: Id;
  readonly name: keyof UIEventPipeFocus;
  readonly focus: UIFocusProps;
  readonly isFocused: boolean;
  readonly isBlurred: boolean;
  readonly target: UIEventTarget;
};
export type UIFocusProps = UIEventBase;
