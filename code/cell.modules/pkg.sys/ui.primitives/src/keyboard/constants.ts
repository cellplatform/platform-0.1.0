import { slug } from './common';
import { KeyboardState } from './types';

export const SINGLETON_INSTANCE = `keyboard:singleton:${slug()}`;

/**
 * Defaults
 */
const STATE: KeyboardState = {
  last: undefined,
  current: {
    modified: false,
    modifierKeys: { shift: [], ctrl: [], alt: [], meta: [] },
    modifiers: { shift: false, ctrl: false, alt: false, meta: false },
    pressed: [],
  },
};

export const DEFAULT = { STATE };
