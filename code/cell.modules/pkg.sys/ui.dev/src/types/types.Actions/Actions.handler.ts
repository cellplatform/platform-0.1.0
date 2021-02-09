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
};

/**
 * Simple Button handler.
 */
export type ActionButtonHandler<C> = (e: t.ActionButtonHandlerArgs<C>) => void;
export type ActionButtonHandlerArgs<C> = t.ActionHandlerArgs<C> & {
  readonly settings: t.ActionHandlerSettings<
    ActionButtonHandlerArgs<C>,
    ActionHandlerSettingsButtonArgs
  >;
  readonly button: t.ActionButtonProps;
};
export type ActionHandlerSettingsButtonArgs = t.ActionHandlerSettingsArgs & {
  button?: Partial<t.ActionButtonProps>;
};

/**
 * Boolean (switch) handler.
 */
export type ActionBooleanHandler<C> = (e: t.ActionBooleanHandlerArgs<C>) => void;
export type ActionBooleanHandlerArgs<C> = t.ActionHandlerArgs<C> & {
  readonly settings: t.ActionHandlerSettings<
    ActionBooleanHandlerArgs<C>,
    ActionHandlerSettingsBooleanArgs
  >;
  readonly boolean: t.ActionBooleanProps;
  readonly changing?: t.ActionBooleanChanging; // Exists when an interaction has causes the state to change.
};
export type ActionHandlerSettingsBooleanArgs = t.ActionHandlerSettingsArgs & {
  boolean?: Partial<t.ActionBooleanProps>;
};

/**
 * Select (dropdown) handler.
 */
export type ActionSelectHandler<C> = (e: t.ActionSelectHandlerArgs<C>) => void;
export type ActionSelectHandlerArgs<C> = t.ActionHandlerArgs<C> & {
  readonly settings: t.ActionHandlerSettings<
    ActionSelectHandlerArgs<C>,
    ActionHandlerSettingsSelectArgs
  >;
  readonly select: t.ActionSelectProps;
  readonly changing?: t.ActionSelectChanging; // Exists when an interaction has causes the state to change.
};
export type ActionHandlerSettingsSelectArgs = t.ActionHandlerSettingsArgs & {
  select?: Partial<t.ActionSelectProps>;
};
