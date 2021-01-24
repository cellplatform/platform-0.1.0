import { t } from './common';

type A = t.DevActionsChangeType;

export type DevActionsModelState<Ctx> = t.BuilderModel<t.DevActionsModel<Ctx>, A>;
export type DevActionsModel<Ctx> = {
  ns: string;
  name: string;
  items: t.DevActionItem[];
  ctx?: Ctx;
  getContext?: t.DevActionGetContext<Ctx>;
  renderSubject?: t.DevActionRenderSubject<Ctx>;
};

export type DevActionGetContext<T> = (prev: T | null) => T;
