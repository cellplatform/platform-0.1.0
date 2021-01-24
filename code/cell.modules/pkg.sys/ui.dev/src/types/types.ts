type N = number | null;

export type DevEdgeSpacing = number | [N, N] | [N, N, N, N];
export type DevOrientation = 'x' | 'y';

export type IDevAbsolutePosition = {
  top?: string | number;
  right?: string | number;
  bottom?: string | number;
  left?: string | number;
};
