import { t } from '../common';

/**
 * Handler that retrieves the current context.
 * NOTE:
 *    To not re-calculate the context each time, the previous
 *    context is passed. Return this if a new context is not required.
 *
 */
export type ActionHandlerContext<C> = (e: ActionHandlerContextArgs<C>) => C;

export type ActionHandlerContextArgs<C> = {
  readonly namespace: string;
  readonly prev: C | undefined;
  readonly current: C | undefined;
  readonly change: ActionHandlerContextChange<C>;
  redraw(): void;
};

export type ActionHandlerContextChange<C> = {
  ctx(fn: (draft: C) => void): ActionHandlerContextArgs<C>;
  settings: t.ActionHandlerSettings<ActionHandlerContextArgs<C>>;
};
