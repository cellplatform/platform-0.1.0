import { t } from '../../common';

/**
 * Render the subject(s) under test.
 */
export function renderSubject<Ctx>(args: { ctx: Ctx; factory?: t.DevActionRenderSubject<Ctx> }) {
  type R = t.DevActionRenderSubjectResult<any>;

  const { ctx, factory } = args;
  const res: R = { ctx, items: [], orientation: 'y', layout: {} };

  if (factory) {
    const payload: t.DevActionRenderSubjectArgs<any> = {
      ctx,
      orientation(value) {
        res.orientation = value;
        return payload;
      },
      layout(value) {
        res.layout = value;
        return payload;
      },
      render(el: JSX.Element, layout?: t.IDevHostedLayout) {
        if (el) res.items.push({ el, layout });
        return payload;
      },
    };

    factory(payload);
  }

  return res;
}
