import { Observable } from 'rxjs';

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
export type KeypressEvent = {
  event: KeyboardEvent;
  isPressed: boolean;
  char: string | null;
  code: string;
  charCode: number;
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
export type KeypressObservable = Observable<KeypressEvent>;
