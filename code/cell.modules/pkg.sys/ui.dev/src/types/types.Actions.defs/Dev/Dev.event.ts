import { t } from '../../common';

export type DevActionEvent =
  | IActionButtonEvent
  | IActionBooleanEvent
  | IActionSelectEvent
  | IActionTextboxEvent;

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
 * Fires for the Textbox action.
 */
export type IActionTextboxEvent = {
  type: 'dev:action/Textbox';
  payload: IActionTextboxPayload;
};
export type IActionTextboxPayload = {
  namespace: string;
  item: t.ActionTextbox;
  changing?: t.ActionTextboxChanging;
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
