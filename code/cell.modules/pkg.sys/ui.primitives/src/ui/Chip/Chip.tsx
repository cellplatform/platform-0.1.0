import { FC, THEMES } from './common';
import { View, ChipProps, height, toBodyArray } from './Chip.View';
import { HashChip as Hash } from './HashChip';

export { ChipProps };

/**
 * Export
 */

type Fields = {
  toBodyArray: typeof toBodyArray;
  Hash: typeof Hash;
  THEMES: typeof THEMES;
};
export const Chip = FC.decorate<ChipProps, Fields>(
  View,
  { toBodyArray, Hash, THEMES },
  { displayName: 'Chip' },
);
