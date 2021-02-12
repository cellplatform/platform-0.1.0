import { t } from '../common';

/**
 * Events
 */
export type ActionEvent =
  | IActionsInitEvent
  | IActionsSelectChangedEvent
  | IActionModelChangedEvent

/**
 * Fires to initialize the state of a set of actions.
 */
export type IActionsInitEvent = {
  type: 'actions/init';
  payload: IActionsInitPayload;
};
export type IActionsInitPayload = { namespace: string };

/**
 * Fires when the <ActionsSelect> dropdown changes.
 */
export type IActionsSelectChangedEvent = {
  type: 'actions/select/changed';
  payload: IActionsSelectChanged;
};
export type IActionsSelectChanged = { namespace: string };

/**
 * Fires when a single action [Item] model state changes.
 */
export type IActionModelChangedEvent = {
  type: 'action/model/changed';
  payload: IActionModelChangedPayload;
};
export type IActionModelChangedPayload = {
  namespace: string;
  index: number;
  item: t.ActionItem;
};

