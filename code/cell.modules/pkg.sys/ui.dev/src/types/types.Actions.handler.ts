import { t } from './common';

/**
 * Common environment values passed to a handler.
 */
export type DevActionHandlerArgs<C> = {
  readonly ctx: C;
  readonly host: t.IDevHost;
};

/**
 * Simple button handler.
 */
export type DevActionButtonHandler<C> = (e: t.DevActionButtonHandlerArgs<C>) => void;
export type DevActionButtonHandlerArgs<C> = t.DevActionHandlerArgs<C>;

/**
 * Boolean (switch) handler.
 */
export type DevActionBooleanHandler<C> = (e: t.DevActionBooleanHandlerArgs<C>) => boolean; // Return the state of the switch.
export type DevActionBooleanHandlerArgs<C> = t.DevActionHandlerArgs<C> & {
  readonly change: boolean; // Flag indicating if the handler is being called because the value needs to change.
};
