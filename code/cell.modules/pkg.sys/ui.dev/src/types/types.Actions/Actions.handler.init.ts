import { t } from '../common';

/**
 * Runs an "initialize" setup when the actions are shown.
 */
export type ActionHandlerInit<C> = (args: t.ActionHandlerInitArgs<C>) => Promise<any>;
export type ActionHandlerInitArgs<C> = {
  bus: t.EventBus<any>;
  ctx: C;
};
