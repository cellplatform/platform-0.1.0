import { t } from '../common';

/**
 * State change actions.
 */
export type DevActionsChangeType = 'via:init' | 'via:button' | 'via:boolean' | 'via:select';

/**
 * Events
 */
export type DevActionEvent =
  | IDevActionsInitEvent
  | IDevActionsSelectChangeEvent
  | IDevActionItemChangedEvent
  | IDevActionButtonEvent
  | IDevActionBooleanEvent
  | IDevActionSelectEvent;

/**
 * Fires to initialize the state of a set of actions.
 */
export type IDevActionsInitEvent = {
  type: 'dev:actions/init';
  payload: IDevActionsInitPayload;
};
export type IDevActionsInitPayload = { ns: string };

/**
 * Fires when the <ActionsSelect> dropdown changes.
 */
export type IDevActionsSelectChangeEvent = {
  type: 'dev:actions/select/change';
  payload: IDevActionsSelectChange;
};
export type IDevActionsSelectChange = { ns: string; name: string };

/**
 * Fires when a single action [Item] model state changes.
 */
export type IDevActionItemChangedEvent = {
  type: 'dev:action/item:changed';
  payload: IDevActionItemChangedPayload;
};
export type IDevActionItemChangedPayload = { ns: string; index: number; model: t.DevActionItem };

/**
 * Fires for the simple Button action.
 */
export type IDevActionButtonEvent = {
  type: 'dev:action/Button';
  payload: IDevActionButtonPayload;
};
export type IDevActionButtonPayload = { ns: string; model: t.DevActionButton };

/**
 * Fires for the Boolean (switch) action.
 */
export type IDevActionBooleanEvent = {
  type: 'dev:action/Boolean';
  payload: IDevActionBooleanPayload;
};
export type IDevActionBooleanPayload = {
  ns: string;
  model: t.DevActionBoolean;
  changing?: t.DevActionBooleanChanging;
};

/**
 * Fires for the Select (dropdown) action.
 */
export type IDevActionSelectEvent = {
  type: 'dev:action/Select';
  payload: IDevActionSelectPayload;
};
export type IDevActionSelectPayload = {
  ns: string;
  model: t.DevActionSelect;
  changing?: t.DevActionSelectChanging;
};
