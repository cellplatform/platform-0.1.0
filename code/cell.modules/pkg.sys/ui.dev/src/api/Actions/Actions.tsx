import { Builder, DEFAULT, StateObject, t } from '../../common';
import { handlers } from './handlers';

type O = Record<string, unknown>;
type A = t.ActionsChangeType;

/**
 * Action builder factory.
 */
export const Actions: t.ActionsFactory = {
  /**
   * Create a new data-model.
   */
  model<Ctx extends O>() {
    const initial = { ...DEFAULT.ACTIONS } as t.ActionsModel<Ctx>;
    return StateObject.create<any, A>(initial);
  },

  /**
   * Create a new API builder.
   */
  api<Ctx extends O>(modelInput: any) {
    const model = (typeof modelInput === 'object'
      ? StateObject.isStateObject(modelInput)
        ? modelInput
        : StateObject.create<t.ActionsModel<Ctx>>(modelInput)
      : Actions.model()) as t.ActionsModelState<Ctx>;

    type M = t.ActionsModel<Ctx>;
    type F = t.ActionsModelMethods<Ctx>;
    return Builder.create<M, F, A>({ model, handlers });
  },
};
