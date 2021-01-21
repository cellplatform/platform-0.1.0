import { t } from './common';

export type ActionModelState<Ctx> = t.BuilderModel<t.ActionModel<Ctx>>;
export type ActionModel<Ctx> = {
  items: t.ActionItem[];
  ctx?: Ctx;
  getContext?: ActionGetContext<Ctx>;
  renderSubject?: ActionRenderSubject;
};

export type ActionHandler<T> = (ctx: T) => void;
export type ActionGetContext<T> = (prev: T | null) => T;

export type ActionRenderSubject = (args: ActionRenderSubjectArgs) => void;
export type ActionRenderSubjectArgs = {
  stack(orientation: 'xy' | 'x' | 'y'): ActionRenderSubjectArgs;
  render(el: JSX.Element): ActionRenderSubjectArgs;
};
export type ActionRenderSubjectResult = {
  el: null | JSX.Element | JSX.Element[];
};
