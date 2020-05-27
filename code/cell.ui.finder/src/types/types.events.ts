import { t } from './common';

/**
 * Events
 */
type GlobalEvents = t.EnvEvent | t.TreeViewEvent;
export type FinderEvent =
  | GlobalEvents
  | IFinderChanged
  | IFinderTreeEvent
  | IFinderViewRequestEvent;

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

/**
 * View
 */
export type IFinderViewRequestEvent = {
  type: 'FINDER/view/req';
  payload: IFinderViewRequest;
};
export type IFinderViewRequest = {
  state: t.IFinderState;
  isHandled: boolean;
  render(el: React.ReactNode | (() => Promise<React.ReactNode>)): void;
};
