import { t, StateObject } from '../../common';

type O = Record<string, unknown>;

/**
 * Reads the context from the factory contained within a model
 * and stores that latest version of the context on the model.
 */
export function getContext<Ctx extends O>(
  model: t.DevActionsModelState<Ctx>,
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
}

/**
 * Provides a way of working with a models current context
 * in a immutable way (but programatically mutable).
 */
export function withinContext<Ctx extends O, Env extends t.DevEnv>(
  model: t.DevActionsModelState<Ctx>,
  env: Env,
  handler: (ctx: Ctx, env: Env) => any,
) {
  // Ensure the latest context is derived (and stored on the model).
  const ctx = getContext<Ctx>(model, { throw: true });
  if (!ctx) throw new Error('No [context]');

  // Run the callback handler passing in immutable proxies.
  type S = { ctx: Ctx; env: Env };
  const state = StateObject.create<S>({ ctx, env });
  const res = state.change((draft) => handler(draft.ctx, draft.env));
  state.dispose();

  // Update the model [ctx] if the handler changed the context.
  const changed = res.changed;
  if (changed) {
    model.change((draft) => (draft.ctx.current = changed.to.ctx || undefined), {
      action: 'Dev/Action/ctx',
    });
  }

  // Finish up.
  return {
    ctx: model.state.ctx, // NB: This is the "current" value updated by the handler.
    env: state.state.env,
    changed: res.changed,
  };
}

/**
 * [Helpers]
 */

export function isCtxChanged(patches: t.PatchSet) {
  return patches.next.some((p) => p.path === 'ctx' || p.path.startsWith('ctx/'));
}
