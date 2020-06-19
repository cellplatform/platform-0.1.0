import * as t from './types';
import { FinderEvent } from '../types';

export type AppEvent = FinderEvent;

/**
 * The context object passed down through a React component hierarchy.
 */
export type IAppContext = t.IEnvContext<AppEvent> & { getState(): IAppState };

export type IAppStore = t.IStore<IAppState, AppEvent>;

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
