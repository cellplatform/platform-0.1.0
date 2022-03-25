import { Observable } from 'rxjs';
import { filter } from 'rxjs/operators';

import { t } from '../common';

/**
 * An event handler mechanism for a specific key, or kind of key.
 */
export function toKey(
  keypress$: Observable<t.KeyboardKeypress>,
  stage: t.KeyboardStage,
): t.KeyboardKeyEvents {
  type F = (e: t.KeyboardKeypress) => boolean;
  const stage$ = keypress$.pipe(filter((e) => e.stage === stage));

  const handle = (keyFilter: F) => {
    const handler = (fn?: t.KeyboardKeyHandler) => {
      const $ = stage$.pipe(filter(keyFilter));
      if (fn) $.subscribe((e) => fn?.(e));
      return { $ };
    };
    return handler;
  };

  const _lazy = {};
  const lazy = (name: string, keyFilter: F): t.KeyboardKeyHandlerMethod => {
    return _lazy[name] || (_lazy[name] = handle(keyFilter));
  };

  const api: t.KeyboardKeyEvents = {
    key(key, fn) {
      return lazy(`key.${key}`, (e) => e.key === key)(fn);
    },
    code(key, fn) {
      return lazy(`code.${key}`, (e) => e.keypress.code === key)(fn);
    },
    get enter() {
      return lazy('enter', (e) => e.is.enter);
    },
    get escape() {
      return lazy('escape', (e) => e.is.escape);
    },
  };

  return api;
}
