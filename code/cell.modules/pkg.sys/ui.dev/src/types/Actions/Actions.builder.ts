import { t } from '../common';

type O = Record<string, unknown>;

/**
 * Model Builder API
 */
export type DevActions<Ctx extends O> = t.BuilderChain<DevActionsModelMethods<Ctx>>;

export type DevActionsModelMethods<Ctx extends O> = DevActionsModelInputMethods<Ctx> & {
  toEvents(): t.DevActionsModelState<Ctx>['event'];
  toObject(): t.DevActionsModel<Ctx>;
  toModel(): t.DevActionsModelState<Ctx>;
  toContext(): Ctx;
  clone(ctx?: t.DevActionGetContext<Ctx>): t.DevActions<Ctx>;

  renderList(bus: t.EventBus, props?: t.ActionPanelProps): JSX.Element;
  renderSubject(): t.DevActionSubject<Ctx>;

  merge(actions: DevActions<any>, options?: DevActionAddOptions): t.DevActions<Ctx>;
  context(factory: t.DevActionGetContext<Ctx>): t.DevActions<Ctx>;
  subject(factory: t.DevActionHandlerSubject<Ctx>): t.DevActions<Ctx>;
  name(name: string): t.DevActions<Ctx>;
};

export type DevActionAddOptions = { insertAt?: 'end' | 'start' };

export type DevActionsModelInputMethods<Ctx extends O> = {
  button(label: string, handler?: t.DevActionButtonHandler<Ctx>): t.DevActions<Ctx>;
  button(config: DevActionButtonConfig<Ctx>): t.DevActions<Ctx>;
  boolean(label: string, handler?: t.DevActionBooleanHandler<Ctx>): t.DevActions<Ctx>;
  boolean(config: DevActionBooleanConfig<Ctx>): t.DevActions<Ctx>;
  select(label: string, handler?: t.DevActionSelectHandler<Ctx>): t.DevActions<Ctx>;
  select(config: DevActionSelectConfig<Ctx>): t.DevActions<Ctx>;
  hr(height?: number, opacity?: number, margin?: t.DevEdgeSpacing): t.DevActions<Ctx>;
  hr(config?: DevActionHrConfig<Ctx>): t.DevActions<Ctx>;
  title(text: string, config?: DevActionTitleConfig<Ctx>): t.DevActions<Ctx>;
  title(config: DevActionTitleConfig<Ctx>): t.DevActions<Ctx>;
};

/**
 * Button
 */
export type DevActionButtonConfig<Ctx extends O> = (args: DevActionButtonConfigArgs<Ctx>) => void;
export type DevActionButtonConfigArgs<Ctx extends O> = {
  label(value: string): DevActionButtonConfigArgs<Ctx>;
  description(value: string): DevActionButtonConfigArgs<Ctx>;
  handler(handler: t.DevActionButtonHandler<Ctx>): DevActionButtonConfigArgs<Ctx>;
};

/**
 * Boolean (Switch)
 */
export type DevActionBooleanConfig<Ctx extends O> = (args: DevActionBooleanConfigArgs<Ctx>) => void;
export type DevActionBooleanConfigArgs<Ctx extends O> = {
  label(value: string): DevActionBooleanConfigArgs<Ctx>;
  description(value: string): DevActionBooleanConfigArgs<Ctx>;
  handler(handler: t.DevActionBooleanHandler<Ctx>): DevActionBooleanConfigArgs<Ctx>;
};

/**
 * Boolean (Switch)
 */
export type DevActionSelectConfig<Ctx extends O> = (args: DevActionSelectConfigArgs<Ctx>) => void;
export type DevActionSelectConfigArgs<Ctx extends O> = {
  label(value: string): DevActionSelectConfigArgs<Ctx>;
  description(value: string): DevActionSelectConfigArgs<Ctx>;
  handler(handler: t.DevActionSelectHandler<Ctx>): DevActionSelectConfigArgs<Ctx>;
};

/**
 * Hr (Horizontal Rule)
 */
export type DevActionHrConfig<Ctx extends O> = (args: DevActionHrConfigArgs<Ctx>) => void;
export type DevActionHrConfigArgs<Ctx extends O> = {
  height(value: number): DevActionHrConfigArgs<Ctx>;
  opacity(value: number): DevActionHrConfigArgs<Ctx>;
  margin(value: t.DevEdgeSpacing): DevActionHrConfigArgs<Ctx>;
};

/**
 * Title
 */
export type DevActionTitleConfig<Ctx extends O> = (args: DevActionTitleConfigArgs<Ctx>) => void;
export type DevActionTitleConfigArgs<Ctx extends O> = {
  text(value: string): DevActionTitleConfigArgs<Ctx>;
};
