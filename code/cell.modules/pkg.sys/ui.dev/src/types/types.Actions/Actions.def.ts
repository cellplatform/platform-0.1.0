import { FC } from 'react';
import { t } from '../common';

type O = Record<string, unknown>;

/**
 * Defines an Action plugin that renders and handles
 * an item within an Actions set.
 */
export type ActionDef<Item extends t.ActionItem = any> = {
  kind: string;
  // init(item: t.ActionItem): void;

  config: {
    method: string;
    handler: ActionDefConfigHandler;
  };

  // - Builder handlers
  // - listen
  // - render(): JSX
  Component: FC<{ namespace: string; bus: t.EventBus; model: Item }>;
};

export type ActionDefConfigHandler = (args: ActionDefConfigHandlerArgs) => void;
export type ActionDefConfigHandlerArgs = {
  ctx: O;
  actions: t.ActionsModelState<any>;
  params: any[];
};
