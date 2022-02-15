import { t } from '../common';

/**
 * Common values passed to all handlers.
 */
export type ActionHandlerArgs<C> = {
  readonly ctx: C;
  readonly host: t.Host;
  readonly layout: t.HostedLayout;
  readonly actions: t.HostedActions;
  redraw(): void;
  toObject<T>(proxy: any): T | undefined;
};

/**
 * Method that updates the state of the harness.
 */
export type ActionHandlerSettings<
  T,
  A extends t.ActionHandlerSettingsArgs = t.ActionHandlerSettingsArgs,
> = (settings: A) => T;
export type ActionHandlerSettingsArgs = {
  host?: t.Host | null;
  layout?: t.HostedLayout | null | false;
  actions?: t.HostedActions | null | false;
};
