import { t } from '../common';

/**
 * Events
 */
export type ActionEvent =
  | ActionsInitEvent
  | ActionsDisposeEvent
  | ActionsSelectChangedEvent
  | ActionModelChangedEvent;

/**
 * Fires to initialize the state of a set of actions.
 */
export type ActionsInitEvent = {
  type: 'sys.ui.dev/actions/init';
  payload: ActionsInit;
};
export type ActionsInit = { namespace: string };

/**
 * Fires to when a loaded set of actions are to be disposed (unloaded)
 */
export type ActionsDisposeEvent = {
  type: 'sys.ui.dev/actions/dispose';
  payload: ActionsDispose;
};
export type ActionsDispose = { namespace: string };

/**
 * Fires when the <ActionsSelect> dropdown changes.
 */
export type ActionsSelectChangedEvent = {
  type: 'sys.ui.dev/actions/select/changed';
  payload: ActionsSelectChanged;
};
export type ActionsSelectChanged = { namespace: string };

/**
 * Fires when a single action [Item] model state changes.
 */
export type ActionModelChangedEvent = {
  type: 'sys.ui.dev/action/model/changed';
  payload: ActionModelChanged;
};
export type ActionModelChanged = {
  namespace: string;
  index: number;
  item: t.ActionItem;
};
