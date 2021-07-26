export type EdgePositionX = 'left' | 'center' | 'stretch' | 'right';
export type EdgePositionY = 'top' | 'center' | 'stretch' | 'bottom';

export type BoxEdge = 'top' | 'right' | 'bottom' | 'left';
export type BoxPosition = {
  x?: EdgePositionX;
  y?: EdgePositionY;
};
