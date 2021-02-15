import { t } from '../../common';

type O = Record<string, unknown>;

export const Context = {
  /**
   * Reads the context from the factory contained within a model
   * and stores that latest version of the context on the model.
   */
  getAndStore<Ctx extends O>(
    model: t.ActionsModelState<Ctx>,
    options: { throw?: boolean } = {},
  ): Ctx | null {
    const state = model.state;
    if (state.ctx.get) {
      const value = state.ctx.get(state.ctx.current || null);

      model.change((draft) => (draft.ctx.current = value));

      if (!value && options.throw) {
        const err = `The Actions [context] has not been set. Make sure you've called [actions.context(...)]`;
        throw new Error(err);
      }

      return value;
    } else {
      return null;
    }
  },
};
