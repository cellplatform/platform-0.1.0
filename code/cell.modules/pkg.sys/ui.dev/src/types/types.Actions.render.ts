import { t } from './common';

/**
 * Render "subject" (component under test)
 */
export type DevActionRenderSubject<Ctx> = (args: DevActionRenderSubjectArgs<Ctx>) => void;

export type DevActionRenderSubjectArgs<Ctx> = {
  readonly ctx: Ctx;
  orientation(value: t.DevOrientation, spacing?: number): DevActionRenderSubjectArgs<Ctx>;
  layout(value: t.IDevHostedLayout): DevActionRenderSubjectArgs<Ctx>;
  render(el: JSX.Element, layout?: t.IDevHostedLayout): DevActionRenderSubjectArgs<Ctx>;
};

export type DevActionSubject = {
  items: t.DevActionSubjectItem[];
  layout: t.IDevHostedLayout; // NB: Default layout (individual item layout merged into this)
  orientation: t.DevOrientation;
  spacing: number;
};

export type DevActionSubjectItem = {
  el: JSX.Element;
  layout?: t.IDevHostedLayout;
};
