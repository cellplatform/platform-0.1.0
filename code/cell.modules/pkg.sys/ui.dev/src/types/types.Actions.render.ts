import { t } from './common';

/**
 * Render "subject" (component under test)
 */
export type DevActionRenderSubject<Ctx> = (args: DevActionRenderSubjectArgs<Ctx>) => void;

export type DevActionRenderSubjectArgs<Ctx> = {
  readonly ctx: Ctx;
  orientation(value: t.DevOrientation): DevActionRenderSubjectArgs<Ctx>;
  layout(value: t.IDevHostedLayout): DevActionRenderSubjectArgs<Ctx>;
  render(el: JSX.Element, layout?: t.IDevHostedLayout): DevActionRenderSubjectArgs<Ctx>;
};

export type DevActionRenderSubjectResult<Ctx> = {
  ctx: Ctx;
  orientation: t.DevOrientation;
  layout: t.IDevHostedLayout; // NB: Default layout (individual item layout merged into this)
  items: t.DevActionRenderSubjectItem[];
};

export type DevActionRenderSubjectItem = {
  el: JSX.Element;
  layout?: t.IDevHostedLayout;
};
