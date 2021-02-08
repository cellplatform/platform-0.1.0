import { t } from '../common';

type O = Record<string, unknown>;

/**
 * Model Builder API
 */
export type DevActions<Ctx extends O = any> = t.BuilderChain<DevActionsModelMethods<Ctx>>;

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
  namespace(value: string): t.DevActions<Ctx>;
};

export type DevActionAddOptions = { insertAt?: 'end' | 'start' };

export type DevActionsModelInputMethods<Ctx extends O> = {
  button(label: string, handler?: t.DevActionButtonHandler<Ctx>): t.DevActions<Ctx>;
  button(config: t.DevActionButtonConfig<Ctx>): t.DevActions<Ctx>;
  boolean(label: string, handler?: t.DevActionBooleanHandler<Ctx>): t.DevActions<Ctx>;
  boolean(config: t.DevActionBooleanConfig<Ctx>): t.DevActions<Ctx>;
  select(config: t.DevActionSelectConfig<Ctx>): t.DevActions<Ctx>;
  hr(height?: number, opacity?: number, margin?: t.DevEdgeSpacing): t.DevActions<Ctx>;
  hr(config?: t.DevActionHrConfig<Ctx>): t.DevActions<Ctx>;
  title(text: string, config?: t.DevActionTitleConfig<Ctx>): t.DevActions<Ctx>;
  title(config: t.DevActionTitleConfig<Ctx>): t.DevActions<Ctx>;
};
