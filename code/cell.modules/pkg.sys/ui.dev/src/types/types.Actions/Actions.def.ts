import { FC } from 'react';
import { t } from '../common';

type O = Record<string, unknown>;

/**
 * Defines an Action plugin that renders and handles
 * an item within an Actions set.
 */
export type ActionDef<M extends t.ActionItem = t.ActionItem> = {
  kind: M['kind'];
  Component: FC<{ namespace: string; bus: t.EventBus; item: M }>;

  /**
   * Defines the configuration method.
   * Invoked on the builder to insert and configure a
   * new item into the model.
   */
  config: {
    method: string;
    handler: ActionDefConfigHandler;
  };

  /**
   * Start listening to the event-bus.
   */
  listen?(args: { id: string; actions: t.ActionsModelState<any>; bus: t.EventBus }): void;
};

export type ActionDefConfigHandler<Ctx extends O = any> = (
  args: ActionDefConfigHandlerArgs<Ctx>,
) => void;

export type ActionDefConfigHandlerArgs<Ctx extends O = any> = {
  ctx: Ctx;
  actions: t.ActionsModelState<any>;
  params: any[];
};
