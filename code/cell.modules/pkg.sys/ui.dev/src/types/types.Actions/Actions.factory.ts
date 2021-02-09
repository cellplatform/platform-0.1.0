import { t } from '../common';

type O = Record<string, unknown>;
type B<Ctx extends O> = t.Actions<Ctx>;

/**
 * Factory
 */
export type ActionsFactory = {
  model<Ctx extends O>(): t.ActionsModelState<Ctx>;

  compose<Ctx extends O, Items extends O>(
    defs: t.ActionDef[],
    model?: t.ActionsModelState<Ctx> | t.ActionsModel<Ctx>,
  ): t.Actions<Ctx, Items>;
};
