import { t } from '../../common';

export type EventHistoryItem = {
  id: string;
  timestamp: number;
  event: t.Event;
  count: number;
};

/**
 * A state hook that stores a set of events coming via an event-bus.
 */
export type EventBusHistoryHook = (
  bus?: t.EventBus<any>,
  options?: EventBusHistoryOptions,
) => EventBusHistory;

export type EventBusHistoryOptions = {
  reset$?: t.Observable<void>;
  onChange?: (e: EventBusHistory) => void;
  filter?: <E extends t.Event = t.Event>(e: E) => boolean;
};

export type EventBusHistory = {
  total: number;
  events: EventHistoryItem[];
};
