type Pixels = number;

export type BulletOrientation = 'x' | 'y'; // x:horizontal, y:vertical
export type BulletEdge = 'near' | 'far';
export type BulletSpacing = { before?: Pixels; after?: Pixels };

export type BulletItem<T = any> = {
  data: T;
  spacing?: BulletSpacing;
  child?: {
    north?: BulletItemRenderer;
    south?: BulletItemRenderer;
    east?: BulletItemRenderer;
    west?: BulletItemRenderer;
  };
};

export type BulletItemRenderer = (e: BulletItemArgs) => JSX.Element | null | undefined;
export type BulletItemArgs<T = any> = {
  kind: 'Default' | 'Spacing';
  index: number;
  total: number;
  data: T;
  orientation: BulletOrientation;
  bullet: { edge: BulletEdge; size: Pixels };
  spacing: BulletSpacing;
  is: {
    empty: boolean;
    single: boolean;
    first: boolean;
    last: boolean;
    edge: boolean;
    vertical: boolean;
    horizontal: boolean;
    spacer: boolean;
    bullet: { near: boolean; far: boolean };
  };
};
