import { t } from './common';

/**
 * Events
 */
export type FinderEvent = t.EnvEvent | t.TreeViewEvent | IFinderViewRenderEvent;

/**
 * View
 */
export type IFinderViewRenderEvent = {
  type: 'FINDER/view/render';
  payload: IFinderViewRender;
};
export type IFinderViewRender = {
  node?: string; // Node ID.
  render(view: React.ReactNode): void;
};

/**
 * Tree
 */
// export type IFinderTreeActionEvent = {
//   type: 'FINDER/tree/action';
//   payload: IFinderTreeAction;
// };
// export type IFinderTreeAction = {
//   event: t.TreeViewEvent;
// };
