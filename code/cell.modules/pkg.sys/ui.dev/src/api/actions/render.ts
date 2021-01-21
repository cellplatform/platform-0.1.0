import { t } from '../../common';

/**
 * Render the subject(s) under test.
 */
export function renderSubject<Ctx>(args: { ctx: Ctx; factory?: t.DevActionRenderSubject<Ctx> }) {
  type R = t.DevActionRenderSubjectResult<any>;

  const { ctx, factory } = args;
  const res: R = { ctx, el: null, orientation: 'y' };

  if (factory) {
    const elements: JSX.Element[] = [];

    const payload: t.DevActionRenderSubjectArgs<any> = {
      ctx,
      stack(value) {
        res.orientation = value;
        return payload;
      },
      render(el: JSX.Element) {
        if (el) elements.push(el);
        return payload;
      },
    };

    factory(payload);

    if (elements.length === 1) res.el = elements[0];
    if (elements.length > 1) res.el = elements;
  }

  return res;
}
