import { t } from './common';

/**
 * State change actions.
 */
export type DevActionsChangeType = 'Dev/Action/ctx';

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
  type: 'Dev/Action/button';
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
  type: 'Dev/Action/boolean';
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
  type: 'Dev/Action/item:changed';
  payload: IDevActionItemChanged;
};
export type IDevActionItemChanged = {
  ns: string;
  index: number;
  model: t.DevActionItem;
};
