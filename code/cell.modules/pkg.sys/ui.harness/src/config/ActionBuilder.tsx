import { Builder, DEFAULT, StateObject, t, toActionPanelModel } from '../common';
import { handlers } from './ActionBuilder.handlers';

const format = Builder.format;

/**
 * Action builder factory.
 */
export const ActionBuilder: t.ActionModelFactory = {
  /**
   * Create a new data-model.
   */
  model<Ctx>(name?: any) {
    const initial = { ...DEFAULT.ACTIONS } as t.ActionModel<Ctx>;
    return StateObject.create<any>(initial);
  },

  /**
   * Create a new data-model builder API.
   */
  builder<Ctx>(input: any) {
    const model = (typeof input === 'object'
      ? StateObject.isStateObject(input)
        ? input
        : StateObject.create<t.ActionModel<Ctx>>(input as any)
      : ActionBuilder.model(input)) as t.ActionModelState<Ctx>;
    return Builder.create<t.ActionModel<Ctx>, t.ActionModelMethods<Ctx>>({ model, handlers });
  },

  /**
   * Converts an input to a model.
   */
  toModel<Ctx>(input: any) {
    return toActionPanelModel<Ctx>(input);
  },
};
