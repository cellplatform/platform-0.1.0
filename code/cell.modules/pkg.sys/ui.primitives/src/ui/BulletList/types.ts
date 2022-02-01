export type BulletOrientation = 'vertical' | 'horizontal';
export type BulletEdge = 'near' | 'far';

export type BulletItem<T = any> = {
  data: T;
  spacing?: number;
};

export type BulletItemRenderer = (e: BulletItemProps) => JSX.Element | null;
export type BulletItemProps<T = any> = {
  index: number;
  total: number;
  data: T;
  orientation: BulletOrientation;
  bulletEdge: BulletEdge;
  spacing: number;
  is: {
    first: boolean;
    last: boolean;
    edge: boolean;
    vertical: boolean;
    horizontal: boolean;
    spacer: boolean;
  };
};
