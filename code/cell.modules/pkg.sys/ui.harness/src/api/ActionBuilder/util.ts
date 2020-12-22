import { t } from '../../common';

export function toContext<Ctx>(model: t.ActionModelState<Ctx>): Ctx | null {
  const state = model.state;
  if (state.getContext) {
    const ctx = state.getContext(state.ctx || null);
    model.change((draft) => (draft.ctx = ctx));
    return ctx;
  } else {
    return null;
  }
}
