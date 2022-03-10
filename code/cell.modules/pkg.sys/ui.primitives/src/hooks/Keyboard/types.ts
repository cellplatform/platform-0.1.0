import { Disposable } from '@platform/types';
import { Observable } from 'rxjs';

import { UIEventBase, UIModifierKeys } from '../UIEvents/types';

type Id = string;

/**
 * Hook for piping a set of keyboard events through an event-bus.
 */
export type KeyboardPipeHook = {
  key: string;
  listeners: number; // Total number of listeners currently operating on the bus.
  events(args?: { dispose$?: Observable<any> }): KeyboardEvents;
};

/**
 * EVENT (API)
 */
export type KeyboardEvents = Disposable & {
  $: Observable<KeyboardEvent>;
  down$: Observable<KeyboardEvent>;
  up$: Observable<KeyboardEvent>;
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
  readonly keyboard: KeyboardKeypressProps;
  readonly is: { down: boolean; up: boolean };
};

export type KeyboardKeypressProps = UIEventBase &
  UIModifierKeys & {
    readonly code: string;
    readonly key: string;
    readonly isComposing: boolean;
    readonly location: number;
    readonly repeat: boolean;
  };
