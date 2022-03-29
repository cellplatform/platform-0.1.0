import { t } from '../common';

/**
 * Render "subject" (component under test)
 */
export type ActionHandlerSubject<C> = (args: t.ActionHandlerSubjectArgs<C>) => void;
export type ActionHandlerSubjectArgs<C> = t.ActionHandlerArgs<C> & {
  readonly settings: t.ActionHandlerSettings<ActionHandlerSubjectArgs<C>>;
  render: ActionSubjectRender<C>;
};

/**
 * Rendering factory.
 */
export type ActionSubjectRender<C> = (
  el?: false | JSX.Element | ActionSubjectRenderFactory<C>,
  layout?: t.HostedLayout,
) => ActionHandlerSubjectArgs<C>;

export type ActionSubjectRenderFactory<C> = (
  e: ActionSubjectRenderFactoryArgs<C>,
) => JSX.Element | null;
export type ActionSubjectRenderFactoryArgs<C> = {
  ctx: C;
};
