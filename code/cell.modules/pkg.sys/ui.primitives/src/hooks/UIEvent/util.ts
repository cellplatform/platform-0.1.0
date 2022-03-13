import React, { RefObject } from 'react';

import { t } from '../common';
import { containsFocus } from '../Focus';

export const Util = {
  toBase(e: React.UIEvent | React.FocusEvent | KeyboardEvent): t.UIEventBase {
    const { bubbles, cancelable, eventPhase, timeStamp, isTrusted } = e;
    return {
      bubbles,
      cancelable,
      eventPhase,
      timeStamp,
      isTrusted,
    };
  },

  toModifierKeys(e: React.MouseEvent | React.TouchEvent | KeyboardEvent): t.UIModifierKeys {
    const { ctrlKey, altKey, metaKey, shiftKey } = e;
    return { ctrlKey, altKey, metaKey, shiftKey };
  },

  toTarget(ref: RefObject<HTMLElement>): t.UIEventTarget {
    return {
      get containsFocus() {
        return containsFocus(ref);
      },
    };
  },
};
