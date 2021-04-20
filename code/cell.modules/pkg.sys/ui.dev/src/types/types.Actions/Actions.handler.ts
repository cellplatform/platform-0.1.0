import { t } from '../common';

/**
 * Handler that retrieves the current context.
 * NOTE:
 *    To not re-calculate the context each time, the previous
 *    context is passed. Return this if a new context is not required.
 *
 */
export type ActionGetContext<C> = (e: ActionGetContextArgs<C>) => C;

export type ActionGetContextArgs<C> = {
  prev: C | undefined;
  change: ActionGetContextChange<C>;
  count: number; // Number of times the context method has been called within the current selection.
};

export type ActionGetContextChange<C> = {
  ctx(fn: (draft: C) => void): ActionGetContextArgs<C>;
  settings: t.ActionHandlerSettings<ActionGetContextArgs<C>>;
};

/**
 * Render "subject" (component under test)
 */
export type ActionHandlerSubject<C> = (args: t.ActionHandlerSubjectArgs<C>) => void;
export type ActionHandlerSubjectArgs<C> = t.ActionHandlerArgs<C> & {
  readonly settings: t.ActionHandlerSettings<ActionHandlerSubjectArgs<C>>;
  render(el: JSX.Element, layout?: t.HostedLayout): ActionHandlerSubjectArgs<C>;
};

/**
 * Controller logic.
 */
export type ActionHandlerController<C> = (args: t.ActionHandlerControllerArgs<C>) => void;
export type ActionHandlerControllerArgs<C> = t.ActionHandlerArgs<C>;

/**
 * Common values passed to all handlers.
 */
export type ActionHandlerArgs<C> = {
  readonly ctx: C;
  readonly host: t.Host;
  readonly layout: t.HostedLayout;
  readonly actions: t.HostedActions;
  toObject<T>(proxy: any): T | undefined;
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
