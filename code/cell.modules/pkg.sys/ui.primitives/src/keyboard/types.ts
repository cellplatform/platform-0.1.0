import { Disposable } from '@platform/types';
import { Observable } from 'rxjs';

import * as t from '../types';

type Id = string;
export type KeyboardStage = 'Down' | 'Up';
export type KeyboardModifierEdges = [] | ['Left'] | ['Right'] | ['Left' | 'Right'];

export type KeyboardKeyFlags = {
  readonly down: boolean;
  readonly up: boolean;
  readonly modifier: boolean;
  readonly number: boolean;
  readonly letter: boolean;
  readonly enter: boolean;
  readonly escape: boolean;
  readonly arrow: boolean;
};

/**
 * State.
 */
export type KeyboardKey = { key: string; code: string; is: KeyboardKeyFlags };
export type KeyboardState = {
  current: {
    modified: boolean;
    modifierKeys: KeyboardModifierKeys;
    modifiers: KeyboardModifierFlags;
    pressed: KeyboardKey[];
  };
  last?: t.KeyboardKeypress;
};

export type KeyboardModifierKeys = {
  shift: KeyboardModifierEdges;
  ctrl: KeyboardModifierEdges;
  alt: KeyboardModifierEdges;
  meta: KeyboardModifierEdges;
};
export type KeyboardModifierFlags = {
  shift: boolean;
  ctrl: boolean;
  alt: boolean;
  meta: boolean;
};

export type KeyboardStateMonitor = Disposable & {
  readonly bus: Id;
  readonly instance: Id;
  readonly keypress$: Observable<KeyboardKeypress>;
  readonly state$: Observable<KeyboardState>;
  readonly state: KeyboardState;
  reset(): void;
};

/**
 * HOOK Keyboard (Monitor/Observable).
 * NB: does not cause redraws.
 */
export type KeyboardHook = {
  readonly alive: boolean;
  readonly bus: Id;
  readonly instance: Id;
  readonly state$: Observable<KeyboardState>;
  readonly state: KeyboardState;
  events(args?: { dispose$?: Observable<any> }): KeyboardEvents;
};

/**
 * HOOK Keyboard (State).
 */
export type KeyboardStateHook = KeyboardHook & {
  readonly alive: boolean;
  readonly bus: Id;
  readonly instance: Id;
  readonly state: KeyboardState;
  events(args?: { dispose$?: Observable<any> }): KeyboardEvents;
};

/**
 * HOOK for piping a set of keyboard events through an event-bus.
 */
export type KeyboardPipeHook = {
  readonly bus: Id;
  readonly instance: Id;
  readonly listeners: number; // Total number of listeners currently operating on the bus.
  events(args?: { dispose$?: Observable<any> }): KeyboardEvents;
};

/**
 * EVENTS (API)
 */
export type KeyboardEvents = Disposable & {
  readonly $: Observable<KeyboardEvent>;
  readonly keypress$: Observable<KeyboardKeypress>;
  readonly down$: Observable<KeyboardKeypress>;
  readonly up$: Observable<KeyboardKeypress>;
  readonly down: KeyboardKeyEvents;
  readonly up: KeyboardKeyEvents;
};

export type KeyboardKeyHandler = (e: KeyboardKeypress) => void;
export type KeyboardKeyHandlerMethod = (fn?: KeyboardKeyHandler) => KeyboardKeyHandlerResponse;
export type KeyboardKeyHandlerResponse = { $: Observable<KeyboardKeypress> };

export type KeyboardKeyEvents = {
  key(key: string, fn?: KeyboardKeyHandler): KeyboardKeyHandlerResponse;
  code(code: string, fn?: KeyboardKeyHandler): KeyboardKeyHandlerResponse;
  enter: KeyboardKeyHandlerMethod;
  escape: KeyboardKeyHandlerMethod;
};

/**
 * EVENT (Definitions)
 */
export type KeyboardEvent = KeyboardKeypressEvent;

/**
 * https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent
 */
export type KeyboardKeypressEvent = {
  type: 'sys.ui.keyboard/keypress';
  payload: KeyboardKeypress;
};
export type KeyboardKeypress = {
  readonly instance: Id;
  readonly name: 'onKeydown' | 'onKeyup';
  readonly key: string;
  readonly keypress: KeyboardKeypressProps;
  readonly is: KeyboardKeyFlags;
  readonly stage: KeyboardStage;
};

export type KeyboardKeypressProps = t.UIEventBase &
  t.UIModifierKeys & {
    readonly code: string;
    readonly key: string;
    readonly isComposing: boolean;
    readonly location: number;
    readonly repeat: boolean;
  };
