import { t } from './common';

export type IAppStore = t.IStore<t.IAppState, t.AppEvent>;

export type IAppState = {
  host?: string;
  ns?: string;
  data?: t.ISpreadsheetData;
  error?: t.ISpreadsheetError;
};
