import * as t from '../common/types';

/**
 * Model for controlling the <Shell>.
 */
export type IShellState = {
  tree: IShellTreeState;
  body: IShellBodyState;
  sidepanel: IShellSidepanelState;
};

export type IShellBodyState = {
  el?: JSX.Element;
};

export type IShellSidepanelState = {
  el?: JSX.Element;
};

export type IShellTreeState = {
  root?: t.ITreeNode;
  current?: string;
};
