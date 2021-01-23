import { t } from './common';

export type DevActionModelState<Ctx> = t.BuilderModel<t.DevActionModel<Ctx>>;
export type DevActionModel<Ctx> = {
  id: string;
  items: t.DevActionItem[];
  ctx?: Ctx;
  getContext?: t.DevActionGetContext<Ctx>;
  renderSubject?: t.DevActionRenderSubject<Ctx>;
};

export type DevActionHandler<T> = (ctx: T) => void;
export type DevActionGetContext<T> = (prev: T | null) => T;
