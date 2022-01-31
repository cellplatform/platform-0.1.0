export type BulletOrientation = 'vertical' | 'horizontal';
export type BulletEdge = 'near' | 'far';

export type BulletItem<T = any> = {
  data: T;
  renderBullet: BulletRender;
  renderBody: BulletRender;
};

export type BulletRender = (e: BulletRenderArgs) => JSX.Element | null;

export type BulletRenderArgs = {
  orientation: BulletOrientation;
  edge: BulletEdge;
  index: number;
  total: number;
  is: {
    first: boolean;
    last: boolean;
    vertical: boolean;
    horizontal: boolean;
    bulletNear: boolean;
    bulletFar: boolean;
  };
};

export type BulletRenderFactory<Ctx> = (getCtx: () => Ctx) => BulletItem;
