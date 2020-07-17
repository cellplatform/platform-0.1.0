export * from '../../common/types';
import * as t from '../../common/types';

export type DebugSheetAction = 'sheet/load';

export type IDebugSheetRead = t.IStateObject<IDebugSheet, DebugSheetAction>;
export type IDebugSheetWrite = t.IStateObjectWritable<IDebugSheet, DebugSheetAction>;

export type IDebugSheet = {
  uri: string;
  sheet?: t.ITypedSheet;
  error: {
    uri?: React.ReactNode;
  };
};
