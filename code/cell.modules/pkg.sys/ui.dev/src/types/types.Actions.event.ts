import { t } from './common';

type O = Record<string, unknown>;

/**
 * Events
 */
export type DevActionEvent = IDevActionButtonClickEvent | IDevActionCtxChangedEvent<any>;

/**
 * Fires when a button action is clicked.
 */
export type IDevActionButtonClickEvent = {
  type: 'Dev/Action/button:click';
  payload: IDevActionButtonClick;
};
export type IDevActionButtonClick = { model: t.DevActionItemButton };

/**
 * Fired when the context has changed.
 */
export type IDevActionCtxChangedEvent<Ctx extends O = any> = {
  type: 'Dev/Action/ctx:changed';
  payload: IDevActionCtxChanged<Ctx>;
};
export type IDevActionCtxChanged<Ctx extends O = any> = {
  actions: string; // [Actions] model id.
  from: Ctx;
  to: Ctx;
};
