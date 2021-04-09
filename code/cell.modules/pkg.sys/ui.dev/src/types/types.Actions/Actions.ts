import { t } from '../common';

type O = Record<string, unknown>;

/**
 * Model builder API.
 */
export type Actions<Ctx extends O = any, Items extends O = any> = {
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
  controller(factory: t.ActionHandlerController<Ctx>): t.Actions<Ctx, Items>;

  items(handler: (args: Items) => void): t.Actions<Ctx, Items>;
};

export type ActionAddOptions = { insertAt?: 'end' | 'start' };

/**
 * A collection of actions.
 */
export type ActionsImport = Promise<any>;
export type ActionsSet = t.Actions | ActionsImport | (t.Actions | t.ActionsImport)[];
