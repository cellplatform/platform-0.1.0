import { t } from '../../common';

/**
 * Render the subject(s) under test.
 */
export function renderSubject<Ctx>(args: { ctx: Ctx; factory?: t.DevActionRenderSubject<Ctx> }) {
  type R = t.DevActionSubject;
  const { ctx, factory } = args;
  const res: R = { items: [], layout: {}, orientation: 'y', spacing: 20 };

  if (factory) {
    const payload: t.DevActionRenderSubjectArgs<any> = {
      ctx,
      orientation(value, spacing) {
        res.orientation = value;
        if (typeof spacing === 'number') res.spacing = Math.max(0, spacing);

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
