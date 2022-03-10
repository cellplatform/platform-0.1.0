import { BehaviorSubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { R, rx, t } from '../common';
import { DEFAULT, SINGLETON_INSTANCE } from './constants';
import { KeyboardEvents } from './Keyboard.Events';

type Id = string;

/**
 * Monitor the state of keyboard events from the given bus.
 */
export function KeyboardStateMonitor(args: { bus: t.EventBus<any>; instance?: Id }) {
  const { instance = SINGLETON_INSTANCE } = args;
  const bus = rx.busAsType<t.KeyboardEvent>(args.bus);
  const events = KeyboardEvents({ bus, instance });
  const { dispose, dispose$ } = events;

  let _current: t.KeyboardState = R.clone(DEFAULT.STATE);
  const change = (fn: (state: t.KeyboardState) => void) => {
    const state = R.clone(_current);
    fn(state);
    _current = state;
    $.next(state);
  };
  const $ = new BehaviorSubject<t.KeyboardState>(_current);

  /**
   * KeyDown
   */
  events.key$.subscribe((e) => {
    const { keypress, is } = e;
    const { code } = keypress;

    const setModifier = (
      target: t.KeyboardModifierKeys,
      targetField: keyof t.KeyboardModifierKeys,
      match: string,
    ) => {
      if (!(code === `${match}Left` || code === `${match}Right`)) return;

      let values = (target[targetField] === false ? [] : target[targetField]) as string[];
      const isLeft = code.endsWith('Left');
      const isRight = code.endsWith('Right');

      if (is.down) {
        if (isLeft) values.push('Left');
        if (isRight) values.push('Right');
      }

      if (!is.down) {
        if (isLeft) values = values.filter((m) => !m.endsWith('Left'));
        if (isRight) values = values.filter((m) => !m.endsWith('Right'));
      }

      values = R.uniq(values);
      target[targetField] = (values.length === 0 ? false : values) as t.KeyboardModifierKeyState;
    };

    change((state) => {
      setModifier(state.modifiers, 'shift', 'Shift');
      setModifier(state.modifiers, 'ctrl', 'Control');
      setModifier(state.modifiers, 'alt', 'Alt');
      setModifier(state.modifiers, 'meta', 'Meta');
    });
  });

  /**
   * API
   */
  return {
    dispose,
    dispose$,
    $: $.pipe(takeUntil(dispose$)),
    get current() {
      return _current;
    },
  };
}
