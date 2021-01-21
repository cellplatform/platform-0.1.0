import { t } from './common';

/**
 * Render "subject" (component under test)
 */
export type DevActionRenderSubject<Ctx> = (args: DevActionRenderSubjectArgs<Ctx>) => void;
export type DevActionRenderSubjectArgs<Ctx> = {
  readonly ctx: Ctx;
  stack(orientation: t.DevOrientation): DevActionRenderSubjectArgs<Ctx>;
  render(el: JSX.Element): DevActionRenderSubjectArgs<Ctx>;
};
export type DevActionRenderSubjectResult<Ctx> = {
  ctx: Ctx;
  el: null | JSX.Element | JSX.Element[];
  orientation: t.DevOrientation;
};
