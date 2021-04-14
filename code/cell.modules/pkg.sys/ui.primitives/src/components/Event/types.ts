import { t } from '../../common';

export type EventLogItem = { id: string; event: t.Event; count: number };

export type EventBusHistoryHook = (args: EventBusHistoryArgs) => EventBusHistory;
export type EventBusHistoryArgs = {
  bus: t.EventBus<any>;
  max?: number;
  reset$?: t.Observable<void>;
};
export type EventBusHistory = {
  total: number;
  events: EventLogItem[];
};
