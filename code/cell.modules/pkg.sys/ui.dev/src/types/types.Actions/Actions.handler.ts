import { t } from '../common';

/**
 * Handler that retrieves the current context.
 * NOTE:
 *    To not re-calculate the context each time, the previous
 *    context is passed. Return this if a new context is not required.
 *
 */
export type ActionGetContext<T> = (prev: T | null) => T;

/**
 * Render "subject" (component under test)
 */
export type ActionHandlerSubject<C> = (args: t.ActionHandlerSubjectArgs<C>) => void;
export type ActionHandlerSubjectArgs<C> = t.ActionHandlerArgs<C> & {
  readonly settings: t.ActionHandlerSettings<ActionHandlerSubjectArgs<C>>;
  render(el: JSX.Element, layout?: t.HostedLayout): ActionHandlerSubjectArgs<C>;
};

/**
 * Common values passed to all handlers.
 */
export type ActionHandlerArgs<C> = {
  readonly ctx: C;
  readonly host: t.Host;
  readonly layout: t.HostedLayout;
  readonly actions: t.HostedActions;
};

/**
 * Method that updates the state of the harness.
 */
export type ActionHandlerSettings<
  T,
  A extends t.ActionHandlerSettingsArgs = t.ActionHandlerSettingsArgs
> = (settings: A) => T;
export type ActionHandlerSettingsArgs = {
  host?: t.Host | null;
  layout?: t.HostedLayout | null;
  actions?: t.HostedActions | null;
};
