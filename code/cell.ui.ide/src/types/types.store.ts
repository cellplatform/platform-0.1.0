import { t } from './common';

export type IAppStore = t.IStore<t.IAppState, t.AppEvent>;

export type IAppState = {
  uri: string;
  text: string;
  typesystem?: { defs: t.INsTypeDef[]; ts: string };
  error?: t.IIdeError;
};
