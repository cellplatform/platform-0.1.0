import { t } from './common';

export type ActionModelState<Ctx> = t.BuilderModel<t.ActionModel<Ctx>>;
export type ActionModel<Ctx> = {
  items: t.ActionItem[];
  getContext?: ActionGetContext<Ctx>;
  ctx?: Ctx;
};

export type ActionHandler<T> = (ctx: T) => void;

/**
 * Context
 */
export type ActionGetContext<T> = (prev: T | null) => T;
