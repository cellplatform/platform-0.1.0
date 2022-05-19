import { FC, THEMES, DEFAULT } from './common';
import { Chip as View, ChipProps, toBodyArray } from './Chip.View';
import { HashChip as Hash } from './Chip.HashChip';

export { ChipProps };

/**
 * Export
 */

type Fields = {
  toBodyArray: typeof toBodyArray;
  Hash: typeof Hash;
  DEFAULT: typeof DEFAULT;
  THEMES: typeof THEMES;
};
export const Chip = FC.decorate<ChipProps, Fields>(
  View,
  { toBodyArray, Hash, DEFAULT, THEMES },
  { displayName: 'Chip' },
);
