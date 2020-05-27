import { t } from './common';

/**
 * Events
 */
type GlobalEvents = t.EnvEvent | t.TreeViewEvent;
export type FinderEvent = GlobalEvents | IFinderChanged | IFinderTreeEvent;
//IFinderViewRenderEvent

export type IFinderChanged = {
  type: 'FINDER/changed';
  payload: t.IStateChange<t.IFinderState, t.FinderEvent>;
};

/**
 * View
 */
// export type IFinderViewRenderEvent = {
//   type: 'FINDER/view/render';
//   payload: IFinderViewRender;
// };
// export type IFinderViewRender = {
//   node?: string; // Node ID.
//   render(view: React.ReactNode): void;
// };

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
  theme?: t.TreeTheme | null;
};
