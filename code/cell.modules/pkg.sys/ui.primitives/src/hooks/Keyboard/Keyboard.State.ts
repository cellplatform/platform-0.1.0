import { BehaviorSubject } from 'rxjs';
import { takeUntil, distinctUntilChanged } from 'rxjs/operators';

import { R, rx, t } from '../common';
import { DEFAULT, SINGLETON_INSTANCE } from './constants';
import { KeyboardEvents } from './Keyboard.Events';

type Id = string;

/**
 * Monitor the state of keyboard events from the given bus.
 */
export function KeyboardStateMonitor(args: {
  bus: t.EventBus<any>;
  instance?: Id;
}): t.KeyboardStateMonitor {
  const { instance = SINGLETON_INSTANCE } = args;
  const bus = rx.busAsType<t.KeyboardEvent>(args.bus);
  const events = KeyboardEvents({ bus, instance });
  const { dispose$, keypress$ } = events;

  const onWindowBlur = () => reset();
  window.addEventListener('blur', onWindowBlur);

  const reset = (options: { hard?: boolean } = {}) => {
    const clone = R.clone(DEFAULT.STATE);
    if (options.hard) {
      // NB: Hard reset, drop everything.
      _current = clone;
    } else {
      // NB: Retain the "last" event history item.
      _current = { ...clone, last: _current.last };
    }
    fireNext();
  };

  const dispose = () => {
    events.dispose();
    window.removeEventListener('blur', onWindowBlur);
  };

  let _current: t.KeyboardState = R.clone(DEFAULT.STATE);
  const change = (fn: (state: t.KeyboardState) => void) => {
    const state = R.clone(_current);
    fn(state);
    _current = state;
  };
  const fireNext = () => current$.next(_current);
  const current$ = new BehaviorSubject<t.KeyboardState>(_current);

  /**
   * State update modifiers.
   */
  const updateModifierKeys = (e: t.KeyboardKeypress) => {
    const code = e.keypress.code;

    const update = (
      target: t.KeyboardModifierKeys,
      targetField: keyof t.KeyboardModifierKeys,
      match: string,
    ) => {
      if (!(code === `${match}Left` || code === `${match}Right`)) return;

      let values = (target[targetField] === false ? [] : target[targetField]) as string[];
      const isLeft = code.endsWith('Left');
      const isRight = code.endsWith('Right');

      if (e.is.down) {
        if (isLeft) values.push('Left');
        if (isRight) values.push('Right');
      } else {
        if (isLeft) values = values.filter((m) => !m.endsWith('Left'));
        if (isRight) values = values.filter((m) => !m.endsWith('Right'));
      }

      values = R.uniq(values);
      target[targetField] = (values.length === 0 ? false : values) as t.KeyboardModifierKeyState;
    };

    change((state) => {
      const modifiers = state.current.modifiers;
      update(modifiers, 'shift', 'Shift');
      update(modifiers, 'ctrl', 'Control');
      update(modifiers, 'alt', 'Alt');
      update(modifiers, 'meta', 'Meta');
      state.current.modified = Object.values(modifiers).some((v) => Boolean(v));
    });
  };

  const toStateKey = (e: t.KeyboardKeypress): t.KeyboardKey => {
    const { is } = e;
    const { key, code } = e.keypress;
    return { key, code, is };
  };

  const updatePressedKeys = (e: t.KeyboardKeypress) => {
    const { keypress, is } = e;
    const { code } = keypress;
    if (is.modifier) return;

    change((state) => {
      const next = state.current;
      if (is.down) {
        const key = toStateKey(e);
        const index = next.pressed.findIndex((item) => item.code === code);
        if (index < 0) next.pressed.push(key);
        if (index >= 0) next.pressed[index] = key;
      } else {
        next.pressed = next.pressed.filter((k) => k.code !== code);
      }
    });
  };

  /**
   * Monitor changes.
   */
  keypress$.subscribe((e) => {
    updateModifierKeys(e);
    updatePressedKeys(e);
    change((state) => (state.last = e));
    fireNext();
  });

  /**
   * API
   */
  return {
    bus: rx.bus.instance(bus),
    instance,
    reset,
    dispose,
    dispose$,
    keypress$,
    state$: current$.pipe(
      takeUntil(dispose$),
      distinctUntilChanged((prev, next) => R.equals(prev, next)),
    ),
    get state() {
      return _current;
    },
  };
}
