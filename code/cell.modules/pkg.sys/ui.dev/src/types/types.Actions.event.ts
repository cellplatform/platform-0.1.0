import { t } from './common';

type O = Record<string, unknown>;

/**
 * Events
 */
export type DevActionEvent =
  | IDevActionButtonEvent
  | IDevActionBooleanEvent
  | IDevActionCtxChangedEvent;

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

/**
 * Fired when the context has changed.
 */
export type IDevActionCtxChangedEvent<Ctx extends O = any> = {
  type: 'Dev/Action/ctx:changed';
  payload: IDevActionCtxChanged<Ctx>;
};
export type IDevActionCtxChanged<Ctx extends O = any> = {
  ns: string; // ID of the [Actions] model.
  from: Ctx;
  to: Ctx;
  patches: t.PatchSet;
};
