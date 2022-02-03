import { t } from '../common';

/**
 * Render "subject" (component under test)
 */
export type ActionHandlerSubject<C> = (args: t.ActionHandlerSubjectArgs<C>) => void;
export type ActionHandlerSubjectArgs<C> = t.ActionHandlerArgs<C> & {
  readonly settings: t.ActionHandlerSettings<ActionHandlerSubjectArgs<C>>;
  render(el?: JSX.Element | false, layout?: t.HostedLayout): ActionHandlerSubjectArgs<C>;
};
