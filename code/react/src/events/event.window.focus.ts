import { Subject } from 'rxjs';
import { share } from 'rxjs/operators';

import { IFocusEvent } from './types';
import { is } from './util';

/**
 * [Focus]
 */
const _focus$ = new Subject<IFocusEvent>();
export const focus$ = _focus$.pipe(share());

(() => {
  let last = document.activeElement;
  function hasChanged() {
    const current = document.activeElement;
    const result = last !== current;
    last = current;
    return result;
  }

  function onEvent(type: IFocusEvent['type']) {
    return () => {
      const e: IFocusEvent = {
        type,
        from: last || undefined,
        to: document.activeElement || undefined,
      };
      if (hasChanged()) {
        _focus$.next(e);
      }
    };
  }

  if (is.browser) {
    window.addEventListener('focus', onEvent('FOCUS'), true);
    window.addEventListener('blur', onEvent('BLUR'), true);
  }
})();
