import * as k from '../types';

/**
 * Boolean flags.
 */
export const Is = {
  /**
   * Flags passed to an item renderer.
   */
  toItemFlags(args: {
    index: number;
    total: number;
    orientation: k.ListOrientation;
    bullet: { edge: k.ListBulletEdge };
  }): k.ListBulletRenderFlags {
    const { index, total, orientation, bullet } = args;
    return {
      empty: total === 0,
      single: total === 1,
      first: index === 0,
      last: index === total - 1,
      edge: index === 0 || index === total - 1,
      horizontal: orientation === 'x',
      vertical: orientation === 'y',
      spacer: false,
      bullet: { near: bullet.edge === 'near', far: bullet.edge === 'far' },
    };
  },
};
