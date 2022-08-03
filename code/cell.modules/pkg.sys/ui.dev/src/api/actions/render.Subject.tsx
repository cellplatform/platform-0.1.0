import { t, toObject } from './common';
import { Context } from './Context';
import { Handler } from './Handler';

/**
 * Render the subject(s) under test.
 */
export function renderSubject(args: { model: t.ActionsModelState<any> }) {
  type P = t.ActionHandlerSubjectArgs<any>;
  type S = t.ActionSubject<any>;

  const { model } = args;
  const redraw = () => model.state.redraw$.next();

  const ctx = Context.getAndStore(model);
  if (!ctx) {
    const err = `Cannot [renderSubject] - the Actions [context] has not been set. Make sure you have called [actions.context(...)]`;
    throw new Error(err);
  }

  const fn = model.state.subject;
  const subject: S = { ctx, items: [], layout: {} };

  if (fn) {
    model.change((draft) => {
      const ctx = draft.ctx.current;
      const env = draft.env.viaSubject;
      const { host, layout, actions } = Handler.params.action({ ctx, env });

      const render: t.ActionSubjectRender<any> = (el, layout) => {
        const elSubject = typeof el === 'function' ? el({ ctx }) : el;
        if (elSubject && elSubject !== null) subject.items.push({ el: elSubject, layout });
        return payload;
      };

      const payload: P = {
        ctx: toObject(ctx),
        toObject,
        host,
        layout,
        actions,
        settings: (args) => Handler.settings.handler({ env, payload })(args),
        render,
        redraw,
      };

      // Invoke the handler.
      fn(payload);
    });
  }

  // Merge results (in priority order).
  const env = model.state.env;
  subject.layout = {
    ...env.viaSubject.layout,
    ...env.viaAction.layout,
    ...subject.layout,
  };

  // Finish up.
  return subject;
}
