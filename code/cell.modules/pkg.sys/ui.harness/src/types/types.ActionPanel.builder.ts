import { t } from './common';

type A<Ctx> = ActionModelBuilder<Ctx>;

/**
 * Factory
 */
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
  clone(ctx?: t.ActionGetContext<Ctx>): A<Ctx>;
  render(props?: t.ActionPanelProps): JSX.Element;

  context(ctx: t.ActionGetContext<Ctx>): A<Ctx>;
  name(value: string | null): A<Ctx>;
  button(label: string, handler: t.ActionHandler<Ctx>): A<Ctx>;
  button(args: ActionButtonConfig<Ctx>): A<Ctx>;
};

/**
 * Button
 */
export type ActionButtonConfig<Ctx> = (args: ActionButtonConfigArgs<Ctx>) => void;
export type ActionButtonConfigArgs<Ctx> = {
  label(value: string): ActionButtonConfigArgs<Ctx>;
  description(value: string): ActionButtonConfigArgs<Ctx>;
  onClick(handler: t.ActionHandler<Ctx>): ActionButtonConfigArgs<Ctx>;
};
