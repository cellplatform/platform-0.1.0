import { Observable } from 'rxjs';

/**
 * Window Resize
 */
export type IWindowResizeEvent = {};

/**
 * Based on [React.IMouseEvent]
 * Note:
 *    Repeated here as exporting this event via the Observables
 *    is causing Typescript type-build errors.
 */
export type IMouseEvent = {
  altKey: boolean;
  button: number;
  buttons: number;
  clientX: number;
  clientY: number;
  ctrlKey: boolean;
  metaKey: boolean;
  movementX: number;
  movementY: number;
  pageX: number;
  pageY: number;
  relatedTarget: EventTarget;
  screenX: number;
  screenY: number;
  shiftKey: boolean;
};

/**
 * Keypress
 */
export type IKeypressEvent = {
  event: KeyboardEvent;
  isPressed: boolean;
  code: string;
  key: string;
  altKey: boolean;
  ctrlKey: boolean;
  shiftKey: boolean;
  metaKey: boolean;
  isModifier: boolean;
  preventDefault: () => void;
  stopPropagation: () => void;
  stopImmediatePropagation: () => void;
};
export type KeypressObservable = Observable<IKeypressEvent>;

/**
 * Focus
 */
export type IFocusEvent = {
  type: 'FOCUS' | 'BLUR';
  from?: Element;
  to?: Element;
};
export type FocusObservable = Observable<IFocusEvent>;
