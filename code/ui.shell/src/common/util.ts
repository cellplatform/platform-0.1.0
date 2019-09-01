import * as t from './types';
import { color as colorUtil } from './libs';

/**
 * Convert loose background input into typed object.
 */
export function toColor(value: t.IShellColor | string | number, defaultValue: t.IShellColor) {
  if (typeof value === 'object') {
    return value;
  } else {
    const color =
      typeof value === 'string' && !value.startsWith('#')
        ? value
        : colorUtil.format(value) || defaultValue.color;
    const fadeSpeed = defaultValue.fadeSpeed;
    return { color, fadeSpeed };
  }
}
