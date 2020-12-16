import { Builder, DEFAULT, StateObject, t } from '../common';
const format = Builder.format;

/**
 * Action builder factory.
 */
export const ActionBuilder: t.ActionModelFactory = {
  /**
   * Create a new data-model.
   */
  model<Ctx>(name?: any) {
    name = format.string(name, { trim: true }) || DEFAULT.ACTIONS.name;
    const initial = { ...DEFAULT.ACTIONS, name } as t.ActionModel<Ctx>;
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
    if (Builder.isBuilder(input)) {
      return (input as t.ActionModelBuilder<Ctx>).toObject();
    }

    if (StateObject.isStateObject(input)) {
      return (input as any).state;
    }

    if (input === undefined || input === null || Array.isArray(input)) {
      return undefined;
    }

    return typeof input === 'object' ? input : undefined;
  },
};

/**
 * Action handlers.
 */

const handlers: t.BuilderHandlers<t.ActionModel<any>, t.ActionModelMethods<any>> = {
  toObject: (args) => args.model.state,

  clone(args) {
    const clone = args.clone();
    if (typeof args.params[0] === 'function') {
      clone.context(args.params[0]);
    }
    return clone;
  },

  name(args) {
    const value = format.string(args.params[0], { trim: true });
    args.model.change((draft) => (draft.name = value || DEFAULT.ACTIONS.name));
  },

  context(args) {
    const value = args.params[0];
    if (typeof value !== 'function') {
      throw new Error('Context factory function not provided');
    }
    args.model.change((draft) => (draft.getContext = value));
  },
};
