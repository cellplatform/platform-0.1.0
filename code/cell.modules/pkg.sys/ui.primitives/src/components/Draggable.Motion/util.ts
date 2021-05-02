import * as n from './types';

export const ItemUtil = {
  toSize(item: n.MotionDraggableItem) {
    const width = typeof item.width === 'function' ? item.width(item) : item.width;
    const height = typeof item.height === 'function' ? item.height(item) : item.height;
    return { width, height };
  },
};
