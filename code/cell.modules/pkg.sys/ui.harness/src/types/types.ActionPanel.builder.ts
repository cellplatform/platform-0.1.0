import { t } from './common';

type A<Ctx> = ActionModelBuilder<Ctx>;

/**
 * Factory
 */
export type ActionModelFactory = {
  model<Ctx>(name?: string): t.ActionModelState<Ctx>;
  builder<Ctx>(input?: t.ActionModelState<Ctx> | t.ActionModel<Ctx>): A<Ctx>;
  toModel<Ctx>(
    input?: A<Ctx> | t.ActionModelState<Ctx> | t.ActionModel<Ctx>,
  ): t.ActionModel<Ctx> | undefined;
};

/**
 * Model Builder API
 */
export type ActionModelBuilder<Ctx> = t.BuilderChain<ActionModelMethods<Ctx>>;

export type ActionModelMethods<Ctx> = ActionModelInputMethods<Ctx> & {
  toObject(): t.ActionModel<Ctx>;
  clone(ctx?: t.ActionGetContext<Ctx>): A<Ctx>;
  render(props?: t.ActionPanelProps): JSX.Element;

  context(ctx: t.ActionGetContext<Ctx>): A<Ctx>;
  group(name: string, config?: ActionGroupConfig<Ctx>): A<Ctx>;
  group(config: ActionGroupConfig<Ctx>): A<Ctx>;
};

export type ActionModelInputMethods<Ctx> = {
  button(label: string, handler?: t.ActionHandler<Ctx>): A<Ctx>;
  button(config: ActionButtonConfig<Ctx>): A<Ctx>;
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

/**
 * Group
 */
export type ActionGroupConfig<Ctx> = (args: ActionGroupConfigArgs<Ctx>) => void;
export type ActionGroupConfigArgs<Ctx> = ActionModelInputMethods<Ctx> & {
  name(value: string): ActionGroupConfigArgs<Ctx>;
};
