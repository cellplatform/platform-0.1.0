import { Builder, DEFAULT, StateObject, t } from '../../common';
import { Handlers } from './Handlers';

type O = Record<string, unknown>;
type A = t.ActionsChangeType;

/**
 * Action builder factory.
 */
export const ActionsFactory: t.ActionsFactory = {
  /**
   * Create a new data-model.
   */
  model<Ctx extends O>(): t.ActionsModelState<Ctx> {
    return StateObject.create<any, A>({ ...DEFAULT.ACTIONS });
  },

  /**
   * Compose together a set of action definitions
   * into an API builder.
   */
  compose<Ctx extends O, Items extends O>(
    defs: t.ActionDef[],
    model?: t.ActionsModel<any>,
  ): t.Actions<Ctx, Items> {
    const actions = Builder.create<any, any, any>({
      model: asModel(model),
      handlers: Handlers.compose([...defs]),
    });
    return (actions as unknown) as t.Actions<Ctx, Items>;
  },
};

/**
 * [Helpers]
 */

function asModel<Ctx extends O>(input?: any) {
  return (typeof input === 'object'
    ? StateObject.isStateObject(input)
      ? input
      : StateObject.create<t.ActionsModel<Ctx>>(input)
    : ActionsFactory.model()) as t.ActionsModelState<Ctx>;
}
