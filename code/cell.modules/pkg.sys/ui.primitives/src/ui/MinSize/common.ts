import { t } from '../../common';
export * from '../../common';
export * from './constants';

/**
 * Derive size flags.
 */
export function toMinSizeFlags(args: {
  size?: t.DomRect;
  minWidth?: number;
  minHeight?: number;
}): t.MinSizeFlags {
  const { size, minWidth, minHeight } = args;

  const isLessThanOrEqual = (left?: number, right?: number) => {
    if (typeof left !== 'number') return null;
    if (typeof right !== 'number') return null;
    return left <= right;
  };

  const tooNarrow = isLessThanOrEqual(size?.width, minWidth);
  const tooShort = isLessThanOrEqual(size?.height, minHeight);

  const tooSmall = tooNarrow || tooShort;
  const ok = !Boolean(tooSmall);

  return { ok, tooSmall, tooNarrow, tooShort };
}
