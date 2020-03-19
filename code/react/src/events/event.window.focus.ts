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
  // tslint:disable-next-line:no-unused-expression
  if (!is.browser) {
    return;
  }

  let last = document.activeElement;
  const hasChanged = () => {
    const current = document.activeElement;
    const result = last !== current;
    last = current;
    return result;
  };

  const onEvent = (type: IFocusEvent['type']) => {
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
  };

  window.addEventListener('focus', onEvent('FOCUS'), true);
  window.addEventListener('blur', onEvent('BLUR'), true);
})();
