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
  | IDevActionsSelectChangedEvent
  | IDevActionModelChangedEvent
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
export type IDevActionsInitPayload = { namespace: string };

/**
 * Fires when the <ActionsSelect> dropdown changes.
 */
export type IDevActionsSelectChangedEvent = {
  type: 'dev:actions/select/changed';
  payload: IDevActionsSelectChanged;
};
export type IDevActionsSelectChanged = { namespace: string };

/**
 * Fires when a single action [Item] model state changes.
 */
export type IDevActionModelChangedEvent = {
  type: 'dev:action/model/changed';
  payload: IDevActionModelChangedPayload;
};
export type IDevActionModelChangedPayload = {
  namespace: string;
  index: number;
  model: t.DevActionItem;
};

/**
 * Fires for the simple Button action.
 */
export type IDevActionButtonEvent = {
  type: 'dev:action/Button';
  payload: IDevActionButtonPayload;
};
export type IDevActionButtonPayload = { namespace: string; model: t.DevActionButton };

/**
 * Fires for the Boolean (switch) action.
 */
export type IDevActionBooleanEvent = {
  type: 'dev:action/Boolean';
  payload: IDevActionBooleanPayload;
};
export type IDevActionBooleanPayload = {
  namespace: string;
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
  namespace: string;
  model: t.DevActionSelect;
  changing?: t.DevActionSelectChanging;
};
