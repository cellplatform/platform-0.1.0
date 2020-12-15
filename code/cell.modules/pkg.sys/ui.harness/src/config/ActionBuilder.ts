import { Builder, DEFAULT, StateObject, t } from '../common';
const format = Builder.format;

/**
 * Action builder factory.
 */
export const ActionBuilder: t.ActionModelFactory = {
  /**
   * Create a new data-model.
   */
  model(name) {
    name = format.string(name, { trim: true }) || '';
    if (!name) {
      throw new Error(`Action panel must be named`);
    }
    const initial = { ...DEFAULT.ACTIONS, name } as t.ActionModel;
    return StateObject.create<t.ActionModel>(initial);
  },

  /**
   * Create a new data-model builder API.
   */
  builder(input) {
    const model = (typeof input === 'object'
      ? StateObject.isStateObject(input)
        ? input
        : StateObject.create<t.ActionModel>(input as any)
      : ActionBuilder.model(input || DEFAULT.ACTIONS.name)) as t.ActionModelState;
    return Builder.create<t.ActionModel, t.ActionModelMethods>({ model, handlers });
  },
};

/**
 * Action handlers.
 */

const handlers: t.BuilderHandlers<t.ActionModel, t.ActionModelMethods> = {
  toObject: (args) => args.model.state,
};
