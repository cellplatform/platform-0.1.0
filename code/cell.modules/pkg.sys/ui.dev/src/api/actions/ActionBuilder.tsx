import { Builder, DEFAULT, StateObject, t, id } from '../../common';
import { handlers } from './handlers';

type O = Record<string, unknown>;

/**
 * Action builder factory.
 */
export const ActionBuilder: t.DevActionModelFactory = {
  /**
   * Create a new data-model.
   */
  model<Ctx extends O>() {
    const initial = { ...DEFAULT.ACTIONS, id: id.shortid() } as t.DevActionModel<Ctx>;
    return StateObject.create<any>(initial);
  },

  /**
   * Create a new model API builder.
   */
  api<Ctx extends O>(input: any) {
    const model = (typeof input === 'object'
      ? StateObject.isStateObject(input)
        ? input
        : StateObject.create<t.DevActionModel<Ctx>>(input as any)
      : ActionBuilder.model()) as t.DevActionModelState<Ctx>;
    return Builder.create<t.DevActionModel<Ctx>, t.DevActionModelMethods<Ctx>>({ model, handlers });
  },
};
