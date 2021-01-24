import { t } from './common';

/**
 * State change actions.
 */
export type DevActionsChangeType = 'Dev/Action/ctx';

/**
 * Events
 */
export type DevActionEvent = IDevActionButtonEvent | IDevActionBooleanEvent;

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
  current(value: boolean): void;
};
