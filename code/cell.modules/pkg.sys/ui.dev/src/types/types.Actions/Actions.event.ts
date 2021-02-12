import { t } from '../common';

/**
 * Events
 */
export type ActionEvent =
  | IActionsInitEvent
  | IActionsSelectChangedEvent
  | IActionModelChangedEvent
  | IActionButtonEvent
  | IActionBooleanEvent
  | IActionSelectEvent;

/**
 * Fires to initialize the state of a set of actions.
 */
export type IActionsInitEvent = {
  type: 'dev:actions/init';
  payload: IActionsInitPayload;
};
export type IActionsInitPayload = { namespace: string };

/**
 * Fires when the <ActionsSelect> dropdown changes.
 */
export type IActionsSelectChangedEvent = {
  type: 'dev:actions/select/changed';
  payload: IActionsSelectChanged;
};
export type IActionsSelectChanged = { namespace: string };

/**
 * Fires when a single action [Item] model state changes.
 */
export type IActionModelChangedEvent = {
  type: 'dev:action/model/changed';
  payload: IActionModelChangedPayload;
};
export type IActionModelChangedPayload = {
  namespace: string;
  index: number;
  item: t.ActionItem;
};

/**
 * Fires for the simple Button action.
 */
export type IActionButtonEvent = {
  type: 'dev:action/Button';
  payload: IActionButtonPayload;
};
export type IActionButtonPayload = {
  namespace: string;
  item: t.ActionButton;
};

/**
 * Fires for the Boolean (switch) action.
 */
export type IActionBooleanEvent = {
  type: 'dev:action/Boolean';
  payload: IActionBooleanPayload;
};
export type IActionBooleanPayload = {
  namespace: string;
  item: t.ActionBoolean;
  changing?: t.ActionBooleanChanging;
};

/**
 * Fires for the Select (dropdown) action.
 */
export type IActionSelectEvent = {
  type: 'dev:action/Select';
  payload: IActionSelectPayload;
};
export type IActionSelectPayload = {
  namespace: string;
  item: t.ActionSelect;
  changing?: t.ActionSelectChanging;
};
