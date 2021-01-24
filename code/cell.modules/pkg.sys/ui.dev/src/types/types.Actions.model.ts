import { t } from './common';

export type DevActionsModelState<Ctx> = t.BuilderModel<t.DevActionsModel<Ctx>>;
export type DevActionsModel<Ctx> = {
  ns: string;
  name: string;
  items: t.DevActionItem[];
  ctx?: Ctx;
  getContext?: t.DevActionGetContext<Ctx>;
  renderSubject?: t.DevActionRenderSubject<Ctx>;
};

export type DevActionGetContext<T> = (prev: T | null) => T;
