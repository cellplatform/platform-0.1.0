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
export function withinContext<Ctx extends O>(
  model: t.DevActionModelState<Ctx>,
  handler: (ctx: O) => void,
) {
  // Ensure the latest context is derived (and stored on the model).
  const ctx = getModelContext<Ctx>(model);
  if (!ctx) return { ctx };

  // Run the callback handler passing in an immutable clone.
  const state = StateObject.create<Ctx>(ctx);
  const res = state.change((draft) => handler(draft));
  state.dispose();

  const changed = res.changed;
  if (changed) model.change((draft) => (draft.ctx = changed.to || undefined));

  // Finish up.
  return { ctx: model.state.ctx, changed: res.changed };
}
