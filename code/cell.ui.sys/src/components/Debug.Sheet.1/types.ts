export * from '../../common/types';
import * as t from '../../common/types';

export type IDebugSheetRead = t.IStateObjectReadOnly<IDebugSheet, DebugSheetEvent>;
export type IDebugSheetWrite = t.IStateObjectWritable<IDebugSheet, DebugSheetEvent>;

export type IDebugSheet = {
  uri: string;
  sheet?: t.ITypedSheet;
  error: { uri?: React.ReactNode };
};

/**
 * [Events]
 */
export type DebugSheetEvent = IDebugSheetLoadEvent;

export type IDebugSheetLoadEvent = {
  type: 'DEBUG/Sheet/load';
  payload: IDebugSheetLoad;
};
export type IDebugSheetLoad = { uri: string };
