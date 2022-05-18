import { FC } from '../../common';
import { View, ChipProps, height, toBodyArray } from './Chip.View';
import { HashChip as Hash } from './HashChip';

export { ChipProps };

/**
 * Export
 */

type Fields = {
  toBodyArray: typeof toBodyArray;
  height: number;
  Hash: typeof Hash;
};
export const Chip = FC.decorate<ChipProps, Fields>(
  View,
  { toBodyArray, height, Hash },
  { displayName: 'Chip' },
);
