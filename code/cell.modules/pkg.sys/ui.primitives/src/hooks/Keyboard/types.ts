import { Disposable } from '@platform/types';
import { Observable } from 'rxjs';

import * as t from '../../types';

type Id = string;
export type KeyboardModifierEdges = ['Left'] | ['Right'] | ['Left' | 'Right'];

export type KeyboardKeyFlags = {
  readonly down: boolean;
  readonly up: boolean;
  readonly modifier: boolean;
  readonly number: boolean;
  readonly letter: boolean;
  readonly enter: boolean;
  readonly escape: boolean;
};

/**
 * State.
 */
export type KeyboardKey = { key: string; code: string; is: KeyboardKeyFlags };
export type KeyboardState = {
  modified: boolean;
  modifiers: KeyboardModifierKeys;
  pressed: KeyboardKey[];
};

export type KeyboardModifierKeyState = false | KeyboardModifierEdges;
export type KeyboardModifierKeys = {
  shift: KeyboardModifierKeyState;
  ctrl: KeyboardModifierKeyState;
  alt: KeyboardModifierKeyState;
  meta: KeyboardModifierKeyState;
};

export type KeyboardStateMonitor = Disposable & {
  readonly key$: Observable<KeyboardKeypress>;
  readonly current$: Observable<KeyboardState>;
  readonly current: KeyboardState;
  reset(): void;
};

/**
 * HOOK keyboard state.
 */
export type KeyboardHook = {
  readonly bus: Id;
  readonly instance: Id;
  readonly current: KeyboardState;
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
  readonly key$: Observable<KeyboardKeypress>;
  readonly down$: Observable<KeyboardKeypress>;
  readonly up$: Observable<KeyboardKeypress>;
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
  readonly keypress: KeyboardKeypressProps;
  readonly is: KeyboardKeyFlags;
};

export type KeyboardKeypressProps = t.UIEventBase &
  t.UIModifierKeys & {
    readonly code: string;
    readonly key: string;
    readonly isComposing: boolean;
    readonly location: number;
    readonly repeat: boolean;
  };
