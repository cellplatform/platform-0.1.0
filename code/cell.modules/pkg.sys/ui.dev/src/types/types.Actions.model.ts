import { t } from './common';

type A = t.DevActionsChangeType;

export type DevActionsModelState<Ctx> = t.BuilderModel<t.DevActionsModel<Ctx>, A>;
export type DevActionsModel<Ctx> = {
  ns: string;
  name: string;
  items: t.DevActionItem[];
  renderSubject?: t.DevActionRenderSubject<Ctx>;
  ctx: { current?: Ctx; get?: t.DevActionGetContext<Ctx> };
  env: { host?: t.IDevHost };
};

export type DevActionGetContext<T> = (prev: T | null) => T;
