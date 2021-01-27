import { t } from '../common';

/**
 * Handler that retrieves the current context.
 * NOTE:
 *    To not re-calculate the context each time, the previous
 *    context is passed. Return this if a new context is not required.
 *
 */
export type DevActionGetContext<T> = (prev: T | null) => T;

/**
 * Render "subject" (component under test)
 */
export type DevActionHandlerSubject<C> = (args: t.DevActionHandlerSubjectArgs<C>) => void;
export type DevActionHandlerSubjectArgs<C> = t.DevActionHandlerArgs<C> & {
  readonly settings: t.DevActionHandlerSettings<DevActionHandlerSubjectArgs<C>>;
  render(el: JSX.Element, layout?: t.IDevHostedLayout): DevActionHandlerSubjectArgs<C>;
};

/**
 * Common values passed to all handlers.
 */
export type DevActionHandlerArgs<C> = {
  readonly ctx: C;
  readonly host: t.IDevHost;
  readonly layout: t.IDevHostedLayout;
};

/**
 * Method that updates the state of the harness.
 */
export type DevActionHandlerSettings<
  T,
  A extends t.DevActionHandlerSettingsArgs = t.DevActionHandlerSettingsArgs
> = (settings: A) => T;
export type DevActionHandlerSettingsArgs = {
  host?: t.IDevHost | null;
  layout?: t.IDevHostedLayout | null;
};

/**
 * Simple Button handler.
 */
export type DevActionButtonHandler<C> = (e: t.DevActionButtonHandlerArgs<C>) => void;
export type DevActionButtonHandlerArgs<C> = t.DevActionHandlerArgs<C> & {
  readonly settings: t.DevActionHandlerSettings<
    DevActionButtonHandlerArgs<C>,
    DevActionHandlerSettingsButtonArgs
  >;
  readonly button: t.DevActionButtonProps;
};
export type DevActionHandlerSettingsButtonArgs = t.DevActionHandlerSettingsArgs & {
  button?: Partial<t.DevActionButtonProps>;
};

/**
 * Boolean (switch) handler.
 */
export type DevActionBooleanHandler<C> = (e: t.DevActionBooleanHandlerArgs<C>) => void;
export type DevActionBooleanHandlerArgs<C> = t.DevActionHandlerArgs<C> & {
  readonly settings: t.DevActionHandlerSettings<
    DevActionBooleanHandlerArgs<C>,
    DevActionHandlerSettingsBooleanArgs
  >;
  readonly boolean: t.DevActionBooleanProps;
  readonly changing?: t.DevActionBooleanChanging; // Exists when an interaction has causes the state to change.
};
export type DevActionHandlerSettingsBooleanArgs = t.DevActionHandlerSettingsArgs & {
  boolean?: Partial<t.DevActionBooleanProps>;
};

/**
 * Select (dropdown) handler.
 */
export type DevActionSelectHandler<C> = (e: t.DevActionSelectHandlerArgs<C>) => void;
export type DevActionSelectHandlerArgs<C> = t.DevActionHandlerArgs<C> & {
  readonly settings: t.DevActionHandlerSettings<
    DevActionSelectHandlerArgs<C>,
    DevActionHandlerSettingsSelectArgs
  >;
  readonly select: t.DevActionSelectProps;
  readonly changing?: t.DevActionSelectChanging; // Exists when an interaction has causes the state to change.
};
export type DevActionHandlerSettingsSelectArgs = t.DevActionHandlerSettingsArgs & {
  select?: Partial<t.DevActionSelectProps>;
};
