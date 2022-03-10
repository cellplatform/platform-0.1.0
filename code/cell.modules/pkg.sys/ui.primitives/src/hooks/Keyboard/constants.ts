import { slug } from '../common';
import { KeyboardState } from './types';

export const SINGLETON_INSTANCE = `keyboard:singleton:${slug()}`;

/**
 * Defaults
 */
const STATE: KeyboardState = {
  modifiers: { shift: false, ctrl: false, alt: false, meta: false },
};

export const DEFAULT = { STATE };
