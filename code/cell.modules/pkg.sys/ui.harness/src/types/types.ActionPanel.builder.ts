import { t } from './common';

type B<Ctx> = ActionModelBuilder<Ctx>;

/**
 * Model Builder API
 */
export type ActionModelBuilder<Ctx> = t.BuilderChain<ActionModelMethods<Ctx>>;

export type ActionModelMethods<Ctx> = ActionModelInputMethods<Ctx> & {
  toObject(): t.ActionModel<Ctx>;
  toContext(): Ctx;
  clone(ctx?: t.ActionGetContext<Ctx>): B<Ctx>;
  render(props?: t.ActionPanelProps): JSX.Element;

  merge(actions: ActionModelBuilder<any>, options?: ActionAddOptions): B<Ctx>;
  context(ctx: t.ActionGetContext<Ctx>): B<Ctx>;
  group(name: string, config?: ActionGroupConfig<Ctx>): B<Ctx>;
  group(config: ActionGroupConfig<Ctx>): B<Ctx>;
};

export type ActionAddOptions = {
  insertAt?: 'end' | 'start';
};

export type ActionModelInputMethods<Ctx> = {
  button(label: string, handler?: t.ActionHandler<Ctx>): B<Ctx>;
  button(config: ActionButtonConfig<Ctx>): B<Ctx>;
  hr(config?: ActionHrConfig<Ctx>): B<Ctx>;
  title(text: string, config?: ActionTitleConfig<Ctx>): B<Ctx>;
  title(config: ActionTitleConfig<Ctx>): B<Ctx>;
};

/**
 * Group
 */
export type ActionGroupConfig<Ctx> = (args: ActionGroupConfigArgs<Ctx>) => void;
export type ActionGroupConfigArgs<Ctx> = ActionModelInputMethods<Ctx> & {
  name(value: string): ActionGroupConfigArgs<Ctx>;
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
 * Hr (Horizontal Rule)
 */
export type ActionHrConfig<Ctx> = (args: ActionHrConfigArgs<Ctx>) => void;
export type ActionHrConfigArgs<Ctx> = {
  height(value: number): ActionHrConfigArgs<Ctx>;
};

/**
 * Title
 */
export type ActionTitleConfig<Ctx> = (args: ActionTitleConfigArgs<Ctx>) => void;
export type ActionTitleConfigArgs<Ctx> = {
  text(value: string): ActionTitleConfigArgs<Ctx>;
};
