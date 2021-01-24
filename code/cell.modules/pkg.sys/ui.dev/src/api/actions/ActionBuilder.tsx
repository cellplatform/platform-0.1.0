import { Builder, DEFAULT, StateObject, t, slug } from '../../common';
import { handlers } from './handlers';

type O = Record<string, unknown>;
type A = t.DevActionsChangeType;

/**
 * Action builder factory.
 */
export const ActionBuilder: t.DevActionModelFactory = {
  /**
   * Create a new data-model.
   */
  model<Ctx extends O>() {
    const initial = { ...DEFAULT.ACTIONS, ns: slug() } as t.DevActionsModel<Ctx>;
    return StateObject.create<any, A>(initial);
  },

  /**
   * Create a new model API builder.
   */
  api<Ctx extends O>(input: any) {
    const model = (typeof input === 'object'
      ? StateObject.isStateObject(input)
        ? input
        : StateObject.create<t.DevActionsModel<Ctx>>(input as any)
      : ActionBuilder.model()) as t.DevActionsModelState<Ctx>;

    if (!model.state.ns) {
      model.change((draft) => (draft.ns = slug()));
    }

    type M = t.DevActionsModel<Ctx>;
    type F = t.DevActionsModelMethods<Ctx>;
    return Builder.create<M, F, A>({ model, handlers });
  },
};
