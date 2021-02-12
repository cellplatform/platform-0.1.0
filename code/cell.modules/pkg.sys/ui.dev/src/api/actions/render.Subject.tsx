import { t } from '../../common';
import { Context } from './Context';
import { Handler } from './Handler';

/**
 * Render the subject(s) under test.
 */
export function renderSubject(args: { model: t.ActionsModelState<any> }) {
  type R = t.ActionSubject<any>;
  const { model } = args;

  const ctx = Context.getAndStore(model);
  if (!ctx) {
    const err = `Cannot [renderSubject] - the Actions [context] has not been set. Make sure you've called [actions.context(...)]`;
    throw new Error(err);
  }

  const fnRender = model.state.renderSubject;
  const subject: R = { ctx, items: [], layout: {} };

  if (fnRender) {
    model.change((draft) => {
      const ctx = draft.ctx.current;
      const env = draft.env.viaSubject;
      const { host, layout } = Handler.params.action({ ctx, env });

      type P = t.ActionHandlerSubjectArgs<any>;

      const payload: P = {
        ctx,
        host,
        layout,
        settings: (args) => Handler.setting___OLD({ env, payload })(args),
        render(el: JSX.Element, layout?: t.HostedLayout) {
          if (el) subject.items.push({ el, layout });
          return payload;
        },
      };

      // Invoke the handler.
      fnRender(payload);
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
