import * as t from '../common/types';

/**
 * Model for controlling the <Shell>.
 */
export type IShellState = {
  readonly tree: IShellTreeState;
  readonly body: IShellBodyState;
  readonly sidepanel: IShellSidepanelState;
};

export type IShellTreeState = {
  root?: t.ITreeNode;
  current?: string;
};

export type IShellBodyState = {
  el?: JSX.Element;
  foreground: IColor | string | number;
  background: IColor | string | number;
};

export type IShellSidepanelState = {
  el?: JSX.Element;
  foreground: IColor | string | number;
  background: IColor | string | number;
};

/**
 * Values
 */
export type IColor = { color: string; fadeSpeed: number };
