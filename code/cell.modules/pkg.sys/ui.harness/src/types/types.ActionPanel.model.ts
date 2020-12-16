import { t } from './common';

export type ActionModelState<Ctx> = t.BuilderModel<t.ActionModel<Ctx>>;
export type ActionModel<Ctx> = {
  name: string;
  items: ActionItem[];
  getContext?: ActionGetContext<Ctx>;
};

/**
 * Item types.
 */
export type ActionItem = ActionItemButton;

export type ActionItemButton = {
  type: 'button';
  label: string;
  description?: string;
  onClick: ActionHandler<any>;
};

export type ActionHandler<T> = (ctx: T) => void;

/**
 * Context
 */
export type ActionGetContext<T> = (prev?: T) => T;
