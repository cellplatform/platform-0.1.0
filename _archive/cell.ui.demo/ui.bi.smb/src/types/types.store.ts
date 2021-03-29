import { t } from './common';

export type IAppStore = t.IStore<t.IAppState, t.AppEvent>;

export type IAppState = {
  error?: t.IIdeError;
};
