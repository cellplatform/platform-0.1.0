import { t } from './common';

type O = Record<string, unknown>;

export const Model = {
  /**
   * Retrieves the current state model from a variety of input types.
   */
  state<Ctx extends O>(
    actions: t.Actions | t.ActionsModelState<Ctx> | t.ActionsModel<Ctx>,
  ): t.ActionsModel<Ctx> {
    const input = actions as any;
    if (typeof input.toModel === 'function') return (input as t.Actions).toModel().state;
    if (typeof input.change === 'function') return (input as t.ActionsModelState<any>).state;
    return actions as t.ActionsModel<Ctx>;
  },

  /**
   * Looks up an item.
   */
  item<T extends t.ActionItem>(
    actions: t.Actions | t.ActionsModelState<any> | t.ActionsModel<any>,
    idOrIndex: string | number,
  ) {
    const items = Model.state(actions).items;
    const index =
      typeof idOrIndex === 'number' ? idOrIndex : items.findIndex((item) => item.id === idOrIndex);
    const item = items[index] as T;
    return { item, index };
  },
};
