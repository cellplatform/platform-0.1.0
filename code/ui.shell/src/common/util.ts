import * as t from './types';
import { color as colorUtil } from './libs';

/**
 * Determine if the given color value it transparent
 */
export function isTransparent(input: string | number) {
  return input === 0 ? true : input === 'rgba(0, 0, 0, 0.0)' || input === 'transparent';
}

/**
 * Convert loose background input into typed object.
 */
export function toColor(value: t.IShellColor | string | number, defaultValue: t.IShellColor) {
  const done = (result: t.IShellColor) => {
    result = isTransparent(result.color) ? { ...result, color: 'transparent' } : result;
    return result;
  };

  if (typeof value === 'object') {
    return done(value);
  } else {
    const color =
      typeof value === 'string' && !value.startsWith('#')
        ? value
        : colorUtil.format(value) || defaultValue.color;
    const fadeSpeed = defaultValue.fadeSpeed;
    return done({ color, fadeSpeed });
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

/**
 * Convert a color into border CSS.
 */
export function toBorder(
  color: number | string,
  options: { width?: number; style?: 'solid' | 'dashed' } = {},
) {
  const { width = 1, style = 'solid' } = options;
  return isTransparent(color) ? undefined : `${style} ${width}px ${color}`;
}
