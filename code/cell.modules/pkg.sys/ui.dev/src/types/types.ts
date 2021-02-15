type N = number | null;

export type EdgeSpacing = number | [N, N] | [N, N, N, N];
export type Orientation = 'x' | 'y';

export type AbsolutePosition = {
  top?: string | number;
  right?: string | number;
  bottom?: string | number;
  left?: string | number;
};
