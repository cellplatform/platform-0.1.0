import { t } from './common';

export type IAppStore = t.IStore<t.IAppState, t.AppEvent>;

export type IAppState = {
  tree: {
    root?: t.ITreeNode;
    current?: string;
    selected?: string;
    theme?: t.TreeTheme;
  };
  error?: {
    root?: t.IFinderError;
    tree?: t.IFinderError;
    view?: t.IFinderError;
  };
  view: {
    el?: React.ReactNode;
    isSpinning?: boolean;
  };
};
