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

/**
 * Convert loose size value into typed object.
 */
export function toSize(value: t.IShellSize | number, defaultValue: t.IShellSize) {
  if (typeof value === 'object') {
    return value;
  } else {
    const speed = defaultValue.speed;
    return { value, speed };
  }
}
