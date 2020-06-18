import { t } from './common';

export type IAppStore = t.IStore<t.IAppState, t.AppEvent>;

export type IAppState = {
  uri: string;
  error?: t.IIdeError;
  typesystem?: {
    defs: t.INsTypeDef[];
    ts: string;
  };
};
