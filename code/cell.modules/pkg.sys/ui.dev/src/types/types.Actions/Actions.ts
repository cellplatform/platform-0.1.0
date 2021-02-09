import { t } from '../common';

type O = Record<string, unknown>;

/**
 * Model builder API
 */
export type Actions<Ctx extends O = any, Items extends O = any> = DevActionMethods<Ctx, Items> & {
  toDefs(): t.ActionDef[];
  toEvents(): t.ActionsModelState<Ctx>['event'];
  toObject(): t.ActionsModel<Ctx>;
  toModel(): t.ActionsModelState<Ctx>;
  toContext(): Ctx;

  merge(actions: Actions<any>, options?: ActionAddOptions): t.Actions<Ctx, Items>;
  clone(ctx?: t.ActionGetContext<Ctx>): t.Actions<Ctx, Items>;

  renderActionPanel(bus: t.EventBus, props?: t.ActionPanelProps): JSX.Element;
  renderSubject(): t.ActionSubject<Ctx>;

  namespace(value: string): t.Actions<Ctx, Items>;
  context(factory: t.ActionGetContext<Ctx>): t.Actions<Ctx, Items>;
  subject(factory: t.ActionHandlerSubject<Ctx>): t.Actions<Ctx, Items>;

  items(handler: (args: Items) => void): t.Actions<Ctx, Items>;
};

export type ActionAddOptions = { insertAt?: 'end' | 'start' };

/**
 * Methods for "dev" (development) tp rapidly build and test component- states.
 */
export type DevActionMethods<Ctx extends O, Items extends O = any> = {
  button(label: string, handler?: t.ActionButtonHandler<Ctx>): t.Actions<Ctx, Items>;
  button(config: t.ActionButtonConfig<Ctx>): t.Actions<Ctx, Items>;
  boolean(label: string, handler?: t.ActionBooleanHandler<Ctx>): t.Actions<Ctx, Items>;
  boolean(config: t.ActionBooleanConfig<Ctx>): t.Actions<Ctx, Items>;
  select(config: t.ActionSelectConfig<Ctx>): t.Actions<Ctx, Items>;
  hr(height?: number, opacity?: number, margin?: t.EdgeSpacing): t.Actions<Ctx, Items>;
  hr(config?: t.ActionHrConfig<Ctx>): t.Actions<Ctx, Items>;
  title(text: string, config?: t.ActionTitleConfig<Ctx>): t.Actions<Ctx, Items>;
  title(config: t.ActionTitleConfig<Ctx>): t.Actions<Ctx, Items>;
};
