import { t } from '../../common';
import { Context } from './Context';
import { Handler } from './Handler';

/**
 * Render the subject(s) under test.
 */
export function renderSubject(args: { model: t.DevActionsModelState<any> }) {
  type R = t.DevActionSubject<any>;
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
      const res = Handler.action({ ctx, env });
      const { host, layout } = res;

      type P = t.DevActionHandlerSubjectArgs<any>;

      const payload: P = {
        ctx,
        host,
        layout,
        settings: (args) => Handler.settings({ env, payload })(args),
        render(el: JSX.Element, layout?: t.IDevHostedLayout) {
          if (el) subject.items.push({ el, layout });
          return payload;
        },
      };

      // Invoke the handler.
      fnRender(payload);

      // Merge results (in priority order).
      subject.layout = {
        ...draft.env.viaSubject.layout,
        ...draft.env.viaAction.layout,
        ...subject.layout,
      };
    });
  }

  return subject;
}
