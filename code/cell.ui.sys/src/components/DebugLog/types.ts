import { t } from '../../common';

export type IDebugLogItem = { count: number; data: t.Event<any> };

export type IDebugLogState = {
  total: number;
  items: IDebugLogItem[];
  selectedIndex?: number;
};
