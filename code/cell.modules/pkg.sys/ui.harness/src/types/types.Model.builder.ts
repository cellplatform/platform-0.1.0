import { t } from './common';

type A<Ctx> = ActionModelBuilder<Ctx>;

export type ActionModelFactory = {
  model<Ctx>(name?: string): t.ActionModelState<Ctx>;
  builder<Ctx>(input?: string | t.ActionModelState<Ctx> | t.ActionModel<Ctx>): A<Ctx>;
  toModel<Ctx>(
    input?: A<Ctx> | t.ActionModelState<Ctx> | t.ActionModel<Ctx>,
  ): t.ActionModel<Ctx> | undefined;
};

/**
 * Model Builder API
 */
export type ActionModelBuilder<Ctx> = t.BuilderChain<ActionModelMethods<Ctx>>;

export type ActionModelMethods<Ctx> = {
  toObject(): t.ActionModel<Ctx>;
  name(value: string | null): A<Ctx>;
  context(getContext: t.ActionGetContext<Ctx>): A<Ctx>;
  clone(getContext?: t.ActionGetContext<Ctx>): A<Ctx>;
};
