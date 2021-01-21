import { t } from './common';

type B<Ctx> = DevActionModelBuilder<Ctx>;

/**
 * Model Builder API
 */
export type DevActionModelBuilder<Ctx> = t.BuilderChain<DevActionModelMethods<Ctx>>;

export type DevActionModelMethods<Ctx> = DevActionModelInputMethods<Ctx> & {
  toObject(): t.DevActionModel<Ctx>;
  toContext(): Ctx;
  clone(ctx?: t.DevActionGetContext<Ctx>): B<Ctx>;

  renderList(props?: t.ActionPanelProps): JSX.Element;
  renderSubject(): t.DevActionRenderSubjectResult<Ctx>;

  merge(actions: DevActionModelBuilder<any>, options?: DevActionAddOptions): B<Ctx>;
  context(factory: t.DevActionGetContext<Ctx>): B<Ctx>;
  subject(factory: t.DevActionRenderSubject<Ctx>): B<Ctx>;
};

export type DevActionAddOptions = { insertAt?: 'end' | 'start' };

export type DevActionModelInputMethods<Ctx> = {
  button(label: string, handler?: t.DevActionHandler<Ctx>): B<Ctx>;
  button(config: DevActionButtonConfig<Ctx>): B<Ctx>;
  hr(height?: number, opacity?: number, margin?: t.DevEdgeSpacing): B<Ctx>;
  hr(config?: DevActionHrConfig<Ctx>): B<Ctx>;
  title(text: string, config?: DevActionTitleConfig<Ctx>): B<Ctx>;
  title(config: DevActionTitleConfig<Ctx>): B<Ctx>;
};

/**
 * Button
 */
export type DevActionButtonConfig<Ctx> = (args: DevActionButtonConfigArgs<Ctx>) => void;
export type DevActionButtonConfigArgs<Ctx> = {
  label(value: string): DevActionButtonConfigArgs<Ctx>;
  description(value: string): DevActionButtonConfigArgs<Ctx>;
  onClick(handler: t.DevActionHandler<Ctx>): DevActionButtonConfigArgs<Ctx>;
};

/**
 * Hr (Horizontal Rule)
 */
export type DevActionHrConfig<Ctx> = (args: DevActionHrConfigArgs<Ctx>) => void;
export type DevActionHrConfigArgs<Ctx> = {
  height(value: number): DevActionHrConfigArgs<Ctx>;
  opacity(value: number): DevActionHrConfigArgs<Ctx>;
  margin(value: t.DevEdgeSpacing): DevActionHrConfigArgs<Ctx>;
};

/**
 * Title
 */
export type DevActionTitleConfig<Ctx> = (args: DevActionTitleConfigArgs<Ctx>) => void;
export type DevActionTitleConfigArgs<Ctx> = {
  text(value: string): DevActionTitleConfigArgs<Ctx>;
};
