import { t } from '../common';

type O = Record<string, unknown>;

export type ActionAddOptions = { insertAt?: 'end' | 'start' };

/**
 * Model builder API
 */
export type Actions<Ctx extends O = any> = t.BuilderChain<ActionsModelMethods<Ctx>>;

/**
 * Base methods of the Actions builder.
 */
export type ActionsModelMethods<Ctx extends O> = ActionsModelInputMethods<Ctx> & {
  toEvents(): t.ActionsModelState<Ctx>['event'];
  toObject(): t.ActionsModel<Ctx>;
  toModel(): t.ActionsModelState<Ctx>;
  toContext(): Ctx;
  clone(ctx?: t.ActionGetContext<Ctx>): t.Actions<Ctx>;

  renderActionPanel(bus: t.EventBus, props?: t.ActionPanelProps): JSX.Element;
  renderSubject(): t.ActionSubject<Ctx>;

  merge(actions: Actions<any>, options?: ActionAddOptions): t.Actions<Ctx>;
  context(factory: t.ActionGetContext<Ctx>): t.Actions<Ctx>;
  subject(factory: t.ActionHandlerSubject<Ctx>): t.Actions<Ctx>;
  namespace(value: string): t.Actions<Ctx>;
};

/**
 * Methods for "dev" (development) rapid building and testing of property state.
 */
export type ActionsModelInputMethods<Ctx extends O> = {
  button(label: string, handler?: t.ActionButtonHandler<Ctx>): t.Actions<Ctx>;
  button(config: t.ActionButtonConfig<Ctx>): t.Actions<Ctx>;
  boolean(label: string, handler?: t.ActionBooleanHandler<Ctx>): t.Actions<Ctx>;
  boolean(config: t.ActionBooleanConfig<Ctx>): t.Actions<Ctx>;
  select(config: t.ActionSelectConfig<Ctx>): t.Actions<Ctx>;
  hr(height?: number, opacity?: number, margin?: t.EdgeSpacing): t.Actions<Ctx>;
  hr(config?: t.ActionHrConfig<Ctx>): t.Actions<Ctx>;
  title(text: string, config?: t.ActionTitleConfig<Ctx>): t.Actions<Ctx>;
  title(config: t.ActionTitleConfig<Ctx>): t.Actions<Ctx>;
};
