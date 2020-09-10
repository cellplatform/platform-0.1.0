import { t } from '../../common';
export * from '../../common/types';

export type IDebugLogRead = t.IStateObjectReadable<IDebugLogState>;
export type IDebugLogWrite = t.IStateObjectWritable<IDebugLogState>;

export type IDebugLogState = {
  total: number;
  items: IDebugLogItem[];
  selectedIndex?: number;
  isEnabled: boolean;
};

export type IDebugLogItem = { timestamp: number; count: number; data: t.Event<any> };
