import { t } from './common';

export type IAppStore = t.IStore<t.IAppState, t.AppEvent>;

export type IAppState = {
  host?: string;
  ns?: string;
  data?: t.IAppStateData;
  error?: t.ISpreadsheetError;
};

export type IAppStateData = {
  ns: t.INs;
  cells: t.ICellMap;
  rows: t.IRowMap;
  columns: t.IColumnMap;
  types?: t.IAppStateType[];
};

export type IAppStateType = {
  typename: string;
  columns: t.IColumnTypeDef<t.IType>[];
};
