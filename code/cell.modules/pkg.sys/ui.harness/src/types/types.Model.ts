import { t } from './common';

type O = Record<string, unknown>;

export type ActionModelState<T> = t.BuilderModel<t.ActionModel<T>>;
export type ActionModel<T = O> = {
  name: string;
  items: ActionItem<T>[];
  getContext?: ActionGetContext<T>;
};

export type ActionItem<T> = {
  label: string;
  handler: ActionHandler<T>;
};

export type ActionHandler<T> = (ctx: T) => void;

/**
 * Context
 */
export type ActionGetContext<T> = (prev?: T) => T;
