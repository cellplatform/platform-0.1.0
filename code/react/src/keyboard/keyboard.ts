import { Observable, Subject } from 'rxjs';
import { takeUntil, share, take, filter, map } from 'rxjs/operators';
import { events } from '../events';
import { R } from '../common';
import { IKeypressEvent, KeyBindings, KeyCommand, IKeyBindingEvent, KeyBinding } from './types';

export type KeyboardOptions<T extends KeyCommand> = {
  bindings?: KeyBindings<T>;
  keyPress$?: Observable<IKeypressEvent>;
  dispose$?: Observable<any>;
};

const MODIFIERS = {
  META: 'metaKey',
  CTRL: 'ctrlKey',
  ALT: 'altKey',
  SHIFT: 'shiftKey',
};

const isModifierPressed = (e: IKeypressEvent) => {
  return Object.keys(MODIFIERS)
    .map(key => MODIFIERS[key])
    .some(prop => e[prop] === true);
};

/**
 * Keyboard command manager.
 */
export class Keyboard<T extends KeyCommand> {
  /**
   * [Static]
   */
  public static create<T extends KeyCommand>(options: KeyboardOptions<T>) {
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
  public static parse(pattern: string) {
    const parts = pattern
      .split('+')
      .map(key => key.trim().toUpperCase())
      .map(key => {
        key = key === 'CMD' ? 'META' : key;
        key = key === 'CONTROL' ? 'CTRL' : key;
        return key;
      });
    const modifiers = parts.filter(Keyboard.isModifier);
    const keys = parts.filter(key => !modifiers.some(item => item === key));
    return { keys, modifiers };
  }

  /**
   * [Constructor]
   */
  private constructor(options: KeyboardOptions<T>) {
    const bindingPress$ = new Subject<IKeyBindingEvent<T>>();
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
  private readonly _dispose$ = new Subject();
  public readonly dispose$ = this._dispose$.pipe(share());

  public readonly keyPress$: Observable<IKeypressEvent>;
  public readonly bindingPress$: Observable<IKeyBindingEvent<T>>;
  public readonly bindings: KeyBindings<T> = [];
  public latest: IKeypressEvent | undefined;

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
  public clone(options: Partial<KeyboardOptions<T>>) {
    const dispose$ = options.dispose$;
    const keyPress$ = options.keyPress$ || this.keyPress$;
    const bindings = options.bindings || this.bindings;
    return Keyboard.create({ keyPress$, dispose$, bindings });
  }

  /**
   * Creates a clone of the keyboard with the given keypress filter applied.
   */
  public filter(fn: (e: IKeypressEvent) => boolean) {
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
   * [Internal]
   */

  /**
   * Watches key-presses looking for a match with one of the bindings.
   */
  private monitorBindings(fire: (e: IKeyBindingEvent<T>) => void) {
    const keyPress$ = this.keyPress$;
    let pressedKeys: string[] = [];
    keyPress$
      // Cache up the currently pressed set of keys with modifier.
      .subscribe(e => {
        const hasModifier = isModifierPressed(e);
        if (e.isModifier && !e.isPressed && !hasModifier) {
          pressedKeys = [];
        }
        if (!e.isModifier && hasModifier) {
          pressedKeys = e.isPressed ? R.uniq([...pressedKeys, e.key.toUpperCase()]) : [];
        }
      });

    keyPress$
      .pipe(
        filter(e => e.isPressed),
        filter(e => !e.isModifier),
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
          });
        }
      });
  }

  /**
   * Determine if the given key event matches a binding
   */
  private matchBinding(e: IKeypressEvent, pressedKeys: string[]): KeyBinding<T> | undefined {
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
