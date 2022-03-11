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
  const { dispose$, key$, down$, up$ } = events;

  const onWindowBlur = () => reset();
  window.addEventListener('blur', onWindowBlur);

  const reset = () => {
    _current = R.clone(DEFAULT.STATE);
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
      const modifiers = state.modifiers;
      update(modifiers, 'shift', 'Shift');
      update(modifiers, 'ctrl', 'Control');
      update(modifiers, 'alt', 'Alt');
      update(modifiers, 'meta', 'Meta');
      state.modified = Object.values(modifiers).some((v) => Boolean(v));
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
      if (is.down) {
        const key = toStateKey(e);
        const index = state.pressed.findIndex((item) => item.code === code);
        if (index < 0) state.pressed.push(key);
        if (index >= 0) state.pressed[index] = key;
      } else {
        state.pressed = state.pressed.filter((k) => k.code !== code);
      }
    });
  };

  /**
   * Monitor changes.
   */
  events.key$.subscribe((e) => {
    updateModifierKeys(e);
    updatePressedKeys(e);
    fireNext();
  });

  /**
   * API
   */
  return {
    reset,
    dispose,
    dispose$,
    key$,
    current$: current$.pipe(
      takeUntil(dispose$),
      distinctUntilChanged((prev, next) => R.equals(prev, next)),
    ),
    get current() {
      return _current;
    },
  };
}
