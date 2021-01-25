import { t } from './common';

/**
 * State change actions.
 */
export type DevActionsChangeType = 'via:button' | 'via:boolean';

/**
 * Events
 */
export type DevActionEvent =
  | IDevActionButtonEvent
  | IDevActionBooleanEvent
  | IDevActionItemChangedEvent;

/**
 * Fires for the simple Button action.
 */
export type IDevActionButtonEvent = {
  type: 'dev:action/button';
  payload: IDevActionButton;
};
export type IDevActionButton = {
  ns: string;
  model: t.DevActionItemButton;
};

/**
 * Fires for the Boolean (switch) action.
 */
export type IDevActionBooleanEvent = {
  type: 'dev:action/boolean';
  payload: IDevActionBoolean;
};
export type IDevActionBoolean = {
  ns: string;
  model: t.DevActionItemBoolean;
  change: boolean;
};

/**
 * Fires when a single action Item model changes.
 */
export type IDevActionItemChangedEvent = {
  type: 'dev:action/item:changed';
  payload: IDevActionItemChanged;
};
export type IDevActionItemChanged = {
  ns: string;
  index: number;
  model: t.DevActionItem;
};
