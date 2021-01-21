import { t } from './common';

export type ActionModelState<Ctx> = t.BuilderModel<t.ActionModel<Ctx>>;
export type ActionModel<Ctx> = {
  items: ActionItem[];
  getContext?: ActionGetContext<Ctx>;
  ctx?: Ctx;
};

export type ActionHandler<T> = (ctx: T) => void;

/**
 * Context
 */
export type ActionGetContext<T> = (prev: T | null) => T;

/**
 * Item types.
 */
export type ActionItem = ActionItemInput | ActionItemLayout;
export type ActionItemLayout = ActionItemHr | ActionItemTitle;
export type ActionItemInput = ActionItemButton;

export type ActionItemButton = {
  type: 'button';
  label: string;
  description?: string;
  onClick?: ActionHandler<any>;
};

export type ActionItemHr = {
  type: 'hr';
  height: number;
  opacity: number;
};

export type ActionItemTitle = {
  type: 'title';
  text: string;
};
