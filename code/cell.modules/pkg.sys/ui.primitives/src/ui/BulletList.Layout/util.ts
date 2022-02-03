import { k } from './common';

export const Util = {
  toFlexOrientation(input: k.BulletOrientation, options: { invert?: boolean } = {}) {
    if (options.invert) input = input === 'y' ? 'x' : 'y';
    return input === 'y' ? 'vertical' : 'horizontal';
  },
};
