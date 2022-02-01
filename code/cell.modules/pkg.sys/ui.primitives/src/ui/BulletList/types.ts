export type BulletOrientation = 'vertical' | 'horizontal';
export type BulletEdge = 'near' | 'far';

export type BulletRenderer = (e: BulletProps) => JSX.Element | null;
export type BulletProps<T = any> = {
  data: T;
  orientation: BulletOrientation;
  edge: BulletEdge;
  index: number;
  total: number;
  is: {
    first: boolean;
    last: boolean;
    edge: boolean;
    vertical: boolean;
    horizontal: boolean;
  };
};
