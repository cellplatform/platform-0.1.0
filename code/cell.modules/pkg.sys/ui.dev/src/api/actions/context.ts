import { t, StateObject } from '../../common';

type O = Record<string, unknown>;

/**
 * Reads the context from the factory contained within a model
 * and stores that latest version of the context on the model.
 */
export function getModelContext<Ctx extends O>(model: t.DevActionModelState<Ctx>): Ctx | null {
  const state = model.state;
  if (state.getContext) {
    const ctx = state.getContext(state.ctx || null);
    model.change((draft) => (draft.ctx = ctx));
    return ctx;
  } else {
    return null;
  }
}

/**
 * Provides a way of working with a models current context
 * in a immutable way (but programatically mutable).
 */
export function withinContext<Ctx extends O, Env extends t.DevEnv>(
  bus: t.DevEventBus,
  model: t.DevActionModelState<Ctx>,
  env: Env,
  handler: (ctx: Ctx, env: Env) => any,
) {
  // Ensure the latest context is derived (and stored on the model).
  const ctx = getModelContext<Ctx>(model);
  if (!ctx) {
    throw new Error(`A context has not been setup within the Actions`);
  }

  // Run the callback handler passing in immutable clones.
  type S = { ctx: Ctx; env: Env };
  const state = StateObject.create<S>({ ctx, env });
  const res = state.change((draft) => {
    handler(draft.ctx, draft.env);
  });
  state.dispose();

  // Update the model [ctx] if the handler changed the context.
  const changed = res.changed;
  if (changed) model.change((draft) => (draft.ctx = changed.to.ctx || undefined));

  // Finish up.
  return {
    ctx: model.state.ctx, // NB: This is the "current" value updated by the handler.
    env: state.state.env,
    changed: res.changed,
    fireIfChanged() {
      if (changed) {
        const ns = model.state.ns;
        const { from, to, patches } = changed;
        bus.fire({
          type: 'Dev/Action/ctx:changed',
          payload: { ns, from, to, patches },
        });
      }
    },
  };
}
