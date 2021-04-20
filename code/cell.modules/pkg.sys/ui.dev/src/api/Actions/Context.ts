import { t } from '../../common';
import { Handler } from './Handler';

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
    if (!state.ctx.get) return null;

    const change: t.ActionGetContextChange<Ctx> = {
      ctx(fn) {
        model.change((draft) => {
          const ctx = draft.ctx.current;
          if (!ctx) throw new Error(`Ensure the context has been initially set before changing.`);
          fn(ctx);
        });
        return e;
      },
      settings(args) {
        model.change((draft) => {
          const env = draft.env.viaAction || (draft.env.viaAction = {});
          Handler.settings.update(env, args);
        });
        return e;
      },
    };

    const count = state.ctx.count === undefined ? 0 : state.ctx.count + 1;
    const prev = state.ctx.current;
    const e: t.ActionGetContextArgs<Ctx> = { prev, change, count };
    const value = state.ctx.get(e);

    model.change((draft) => {
      const { ctx } = draft;
      ctx.current = value;
      ctx.count = count;
    });

    if (!value && options.throw) {
      const err = `The Actions [context] has not been set. Make sure you've called [actions.context(...)]`;
      throw new Error(err);
    }

    return value;
  },
};
