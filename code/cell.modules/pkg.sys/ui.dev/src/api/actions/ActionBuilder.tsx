import { Builder, DEFAULT, StateObject, t } from '../../common';
import { handlers } from './handlers';

/**
 * Action builder factory.
 */
export const ActionBuilder: t.DevActionModelFactory = {
  /**
   * Create a new data-model.
   */
  model<Ctx>() {
    const initial = { ...DEFAULT.ACTIONS } as t.DevActionModel<Ctx>;
    return StateObject.create<any>(initial);
  },

  /**
   * Create a new data-model builder API.
   */
  builder<Ctx>(input: any) {
    const model = (typeof input === 'object'
      ? StateObject.isStateObject(input)
        ? input
        : StateObject.create<t.DevActionModel<Ctx>>(input as any)
      : ActionBuilder.model()) as t.DevActionModelState<Ctx>;
    return Builder.create<t.DevActionModel<Ctx>, t.DevActionModelMethods<Ctx>>({ model, handlers });
  },
};
