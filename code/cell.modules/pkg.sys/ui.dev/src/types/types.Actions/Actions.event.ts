import { t } from '../common';

/**
 * State change actions.
 */
export type ActionsChangeType = 'via:init' | 'via:button' | 'via:boolean' | 'via:select';

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
  model: t.ActionItem;
};

/**
 * Fires for the simple Button action.
 */
export type IActionButtonEvent = {
  type: 'dev:action/Button';
  payload: IActionButtonPayload;
};
export type IActionButtonPayload = { namespace: string; model: t.ActionButton };

/**
 * Fires for the Boolean (switch) action.
 */
export type IActionBooleanEvent = {
  type: 'dev:action/Boolean';
  payload: IActionBooleanPayload;
};
export type IActionBooleanPayload = {
  namespace: string;
  model: t.ActionBoolean;
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
  model: t.ActionSelect;
  changing?: t.ActionSelectChanging;
};
