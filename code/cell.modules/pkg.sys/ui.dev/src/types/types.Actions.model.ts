import { t } from './common';

export type DevActionModelState<Ctx> = t.BuilderModel<t.DevActionModel<Ctx>>;
export type DevActionModel<Ctx> = {
  ns: string;
  name: string;
  items: t.DevActionItem[];
  ctx?: Ctx;
  getContext?: t.DevActionGetContext<Ctx>;
  renderSubject?: t.DevActionRenderSubject<Ctx>;
};

export type DevActionGetContext<T> = (prev: T | null) => T;
