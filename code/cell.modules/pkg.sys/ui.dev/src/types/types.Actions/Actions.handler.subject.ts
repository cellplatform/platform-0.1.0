import { t } from '../common';

/**
 * Render "subject" (component under test)
 */
export type ActionHandlerSubject<C> = (args: t.ActionHandlerSubjectArgs<C>) => void;
export type ActionHandlerSubjectArgs<C> = t.ActionHandlerArgs<C> & {
  readonly settings: t.ActionHandlerSettings<ActionHandlerSubjectArgs<C>>;
  render: ActionHandlerSubjectRender<C>;
};

export type ActionHandlerSubjectRender<C> = (
  el?: false | JSX.Element | (() => JSX.Element | null),
  layout?: t.HostedLayout,
) => ActionHandlerSubjectArgs<C>;
