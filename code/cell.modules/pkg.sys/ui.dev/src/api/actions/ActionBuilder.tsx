import { Builder, DEFAULT, StateObject, t } from '../../common';
import { handlers } from './handlers';

type O = Record<string, unknown>;
type A = t.ActionsChangeType;

/**
 * Action builder factory.
 */
export const ActionBuilder: t.ActionModelFactory = {
  /**
   * Create a new data-model.
   */
  model<Ctx extends O>() {
    const initial = { ...DEFAULT.ACTIONS } as t.ActionsModel<Ctx>;
    return StateObject.create<any, A>(initial);
  },

  /**
   * Create a new model API builder.
   */
  api<Ctx extends O>(input: any) {
    const model = (typeof input === 'object'
      ? StateObject.isStateObject(input)
        ? input
        : StateObject.create<t.ActionsModel<Ctx>>(input as any)
      : ActionBuilder.model()) as t.ActionsModelState<Ctx>;

    type M = t.ActionsModel<Ctx>;
    type F = t.ActionsModelMethods<Ctx>;
    return Builder.create<M, F, A>({ model, handlers });
  },
};
