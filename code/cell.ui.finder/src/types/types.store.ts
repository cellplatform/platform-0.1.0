import { t } from './common';

export type IFinderStore = t.IStore<t.IFinderState, t.FinderEvent>;

export type IFinderState = {
  tree: {
    root?: t.ITreeNode;
    current?: string;
    theme?: t.TreeTheme;
  };
};
