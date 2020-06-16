import { t } from './common';

/**
 * Events
 */
type GlobalEvents = t.EnvEvent | t.TreeViewEvent;
type FinderTreeEvent = IFinderTreeEvent | IFinderTreeSelectEvent | IFinderTreeSelectParentEvent;
type FinderViewEvent = IFinderViewEvent | IFinderViewRequestEvent;

export type FinderEvent =
  | GlobalEvents
  | IFinderChanged
  | FinderTreeEvent
  | FinderViewEvent
  | IFinderErrorEvent;

/**
 * Changed
 */
export type IFinderChanged = {
  type: 'FINDER/changed';
  payload: t.IStateChange<t.IFinderState, t.FinderEvent>;
};

/**
 * Tree
 */
export type IFinderTreeEvent = {
  type: 'FINDER/tree';
  payload: IFinderTree;
};
export type IFinderTree = {
  root?: t.ITreeNode | null;
  current?: string | null;
  selected?: string | null;
  theme?: t.TreeTheme | null;
};

export type IFinderTreeSelectEvent = {
  type: 'FINDER/tree/select';
  payload: IFinderTreeSelect;
};
export type IFinderTreeSelect = { node: string };

export type IFinderTreeSelectParentEvent = {
  type: 'FINDER/tree/select/parent';
  payload: IFinderTreeSelectParent;
};
export type IFinderTreeSelectParent = { node: string };

/**
 * View
 */
export type IFinderViewEvent = {
  type: 'FINDER/view';
  payload: IFinderView;
};
export type IFinderView = {
  el?: React.ReactNode | null;
  isSpinning?: boolean | null;
};

export type IFinderViewRequestEvent = {
  type: 'FINDER/view/req';
  payload: IFinderViewRequest;
};
export type IFinderViewRequest = {
  state: t.IFinderState;
  isHandled: boolean;
  render(el: React.ReactNode | (() => Promise<React.ReactNode>)): void;
};

/**
 * Error
 */
export type IFinderErrorEvent = {
  type: 'FINDER/error';
  payload: IFinderError;
};
export type IFinderError = {
  name: 'root' | 'tree' | 'view';
  error: t.IErrorInfo;
  component?: t.IErrorComponent;
};
