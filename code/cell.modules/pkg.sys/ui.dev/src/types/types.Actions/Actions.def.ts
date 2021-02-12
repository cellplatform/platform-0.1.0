import { FC } from 'react';
import { t } from '../common';

type O = Record<string, unknown>;

/**
 * Defines an Action plugin that renders and handles
 * an item within an Actions set.
 */
export type ActionDef<M extends t.ActionItem = t.ActionItem, E extends t.Event = t.Event> = {
  kind: M['kind'];
  Component: FC<{ namespace: string; bus: t.EventBus; model: M }>;

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
   * Invoked upon load to initialize the item
   */
  // init?(args: { id: string; actions: t.Actions; bus: t.EventBus }): Promise<void>;

  listen?(args: {
    id: string;
    actions: t.ActionsModelState<any>;
    event$: t.Observable<E>;
    fire: (e: E) => void;
    // bus: t.EventBus;
    // dispose$: t.Observable<any>;
  }): void;
};

export type ActionDefConfigHandler<Ctx extends O = any> = (
  args: ActionDefConfigHandlerArgs<Ctx>,
) => void;
export type ActionDefConfigHandlerArgs<Ctx extends O = any> = {
  ctx: Ctx;
  actions: t.ActionsModelState<any>;
  params: any[];
};
