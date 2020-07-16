import { t } from '../../common';

export type IDebugLogItem = { timestamp: number; count: number; data: t.Event<any> };

export type IDebugLogState = {
  total: number;
  items: IDebugLogItem[];
  selectedIndex?: number;
};
