import { Observable, Subject } from 'rxjs';
import { filter, map, share, take, takeUntil } from 'rxjs/operators';

import { R } from '../common';
import { events } from '../events';
import * as t from './types';

const MODIFIERS = {
  META: 'metaKey',
  CTRL: 'ctrlKey',
  ALT: 'altKey',
  SHIFT: 'shiftKey',
};

const isModifierPressed = (e: t.IKeypressEvent) => {
  return Object.keys(MODIFIERS)
    .map(key => MODIFIERS[key])
    .some(prop => e[prop] === true);
};

/**
 * Keyboard command manager.
 */
export class Keyboard<T extends t.KeyCommand> implements t.IKeyboard<T> {
  /**
   * [Static]
   */
  public static create<T extends t.KeyCommand>(options: t.IKeyboardArgs<T>) {
    return new Keyboard<T>(options);
  }

  /**
   * Determine whether the given key value is a modifier key (CMD, ALT, CTRL, SHIFT).
   */
  public static isModifier(key: string) {
    return Object.keys(MODIFIERS).some(item => item === key);
  }

  /**
   * Converts a key pattern (eg CMD+N) into it's constituent parts.
   * For example:
   *    `CMD+N` => `{ keys:['n'], modifiers:['META'] }`
   */
  public static parse(pattern: string | boolean | undefined, defaultValue?: string): t.IKeyPattern {
    const EMPTY = { keys: [], modifiers: [] };
    if (pattern === false) {
      return EMPTY;
    }
    pattern = typeof pattern === 'string' ? pattern.trim() : pattern;
    if ((pattern === true || !pattern) && typeof defaultValue === 'string') {
      pattern = defaultValue;
    }
    if (!pattern || typeof pattern !== 'string') {
      return EMPTY;
    }
    const parts = (pattern || '')
      .split('+')
      .map(key => key.trim())
      .filter(key => Boolean(key))
      .map(key => Keyboard.formatKey(key));
    const modifiers = Array.from(new Set(parts.filter(Keyboard.isModifier))) as t.ModifierKey[];
    let keys = parts.filter(key => !modifiers.some(item => item === key));
    keys = Array.from(new Set(keys));
    return { keys, modifiers };
  }

  /**
   * Determines if the given keyboard event matches the given pattern.
   */
  public static matchEvent(pattern: t.IKeyPattern | string, event: Partial<t.IKeyMatchEventArgs>) {
    const key = Keyboard.formatKey(event.key);
    pattern = typeof pattern === 'string' ? Keyboard.parse(pattern) : pattern;

    if (!pattern.keys.includes(key)) {
      return false;
    }

    let eventModifiers: t.ModifierKey[] = [];
    eventModifiers = event.metaKey ? [...eventModifiers, 'META'] : eventModifiers;
    eventModifiers = event.ctrlKey ? [...eventModifiers, 'CTRL'] : eventModifiers;
    eventModifiers = event.altKey ? [...eventModifiers, 'ALT'] : eventModifiers;
    eventModifiers = event.shiftKey ? [...eventModifiers, 'SHIFT'] : eventModifiers;

    if (eventModifiers.length !== pattern.modifiers.length) {
      return false;
    }

    for (const modifier of eventModifiers) {
      if (!pattern.modifiers.includes(modifier)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Normalizes a key value.
   */
  public static formatKey(key?: string) {
    key = key || '';

    // Capitalize modifiers.
    const MODIFIERS = ['CMD', 'COMMAND', 'META', 'CONTROL', 'CTRL', 'ALT', 'SHIFT'];
    key = MODIFIERS.includes(key.toUpperCase()) ? key.toUpperCase() : key;

    // Normaize modifier variants.
    key = key === 'CMD' ? 'META' : key;
    key = key === 'COMMAND' ? 'META' : key;
    key = key === 'CONTROL' ? 'CTRL' : key;

    // Ensure key characters are upper-case.
    key = key.length === 1 ? key.toUpperCase() : key;
    return key;
  }

  /**
   * [Constructor]
   */
  private constructor(options: t.IKeyboardArgs<T>) {
    const bindingPress$ = new Subject<t.IKeyBindingEvent<T>>();
    this.bindingPress$ = bindingPress$.pipe(
      takeUntil(this._dispose$),
      share(),
    );
    let keyPress$ = options.keyPress$ || events.keyPress$;
    this.keyPress$ = keyPress$ = keyPress$.pipe(takeUntil(this._dispose$));
    this.bindings = options.bindings || [];

    keyPress$.subscribe(e => (this.latest = e));
    this.monitorBindings(e => bindingPress$.next(e));

    if (options.dispose$) {
      options.dispose$.pipe(take(1)).subscribe(() => this.dispose());
    }
  }

  /**
   * [Fields]
   */
  private readonly _dispose$ = new Subject<{}>();
  public readonly dispose$ = this._dispose$.pipe(share());

  public readonly keyPress$: Observable<t.IKeypressEvent>;
  public readonly bindingPress$: Observable<t.IKeyBindingEvent<T>>;
  public readonly bindings: t.KeyBindings<T> = [];
  public latest: t.IKeypressEvent | undefined;

  /**
   * [Properties]
   */
  public get isDisposed() {
    return this._dispose$.isStopped;
  }

  /**
   * [Methods]
   */

  /**
   * Disposes of the keyboard.
   */
  public dispose() {
    this._dispose$.next();
    this._dispose$.complete();
  }

  /**
   * Creates a clone of the keyboard overriding the settings with the given options.
   */
  public clone(options: Partial<t.IKeyboardArgs<T>> = {}) {
    const dispose$ = options.dispose$;
    const keyPress$ = options.keyPress$ || this.keyPress$;
    const bindings = options.bindings || this.bindings;
    return Keyboard.create({ keyPress$, dispose$, bindings });
  }

  /**
   * Creates a clone of the keyboard with the given keypress filter applied.
   */
  public filter(fn: (e: t.IKeypressEvent) => boolean) {
    const keyPress$ = this.keyPress$.pipe(filter(fn));
    return this.clone({ keyPress$ });
  }

  /**
   * Creates a clone of the keyboard that stops upon the given observable's first fire.
   */
  public takeUntil(dispose$: Observable<any>) {
    return this.clone({ dispose$ });
  }

  /**
   * [Helpers]
   */

  /**
   * Watches key-presses looking for a match with one of the bindings.
   */
  private monitorBindings(fire: (e: t.IKeyBindingEvent<T>) => void) {
    const keyPress$ = this.keyPress$;
    let pressedKeys: string[] = [];

    keyPress$
      // Cache up the currently pressed set of keys with modifier.
      .subscribe(e => {
        const hasModifier = isModifierPressed(e);
        if (e.isModifier && !e.isPressed && !hasModifier) {
          pressedKeys = [];
        }
        if (!e.isModifier) {
          let key = e.code;
          key = key.startsWith('Key') ? e.code.replace(/^Key/, '') : key;
          key = key.startsWith('Numpad') ? e.code.replace(/^Numpad/, '') : key;
          key = key.startsWith('Digit') ? e.code.replace(/^Digit/, '') : key;
          key = key.length === 1 ? key.toUpperCase() : key;
          pressedKeys = e.isPressed ? R.uniq([...pressedKeys, key]) : [];
        }
      });

    keyPress$
      .pipe(
        filter(e => e.isPressed),
        map(e => ({ event: e, binding: this.matchBinding(e, pressedKeys) })),
      )
      .subscribe(({ event, binding }) => {
        if (binding) {
          const { key, command } = binding;
          fire({
            key,
            command,
            preventDefault: () => event.preventDefault(),
            stopPropagation: () => event.stopPropagation(),
            stopImmediatePropagation: () => event.stopImmediatePropagation(),
            cancel: () => {
              event.preventDefault();
              event.stopImmediatePropagation();
            },
          });
        }
      });
  }

  /**
   * Determine if the given key event matches a binding
   */
  private matchBinding(e: t.IKeypressEvent, pressedKeys: string[]): t.KeyBinding<T> | undefined {
    const hasAllModifiers = (modifiers: string[]) => {
      for (const key of Object.keys(MODIFIERS)) {
        const exists = modifiers.some(item => item === key);
        if (e[MODIFIERS[key]] !== exists) {
          return false;
        }
      }
      return true;
    };

    const hasAllValues = (a: string[], b: string[]) => R.equals(a, b);

    const isMatch = (parts: { modifiers: string[]; keys: string[] }) => {
      return hasAllModifiers(parts.modifiers) && hasAllValues(parts.keys, pressedKeys);
    };

    for (const binding of this.bindings) {
      const parts = Keyboard.parse(binding.key);
      if (isMatch(parts)) {
        return binding;
      }
    }

    return undefined;
  }
}
