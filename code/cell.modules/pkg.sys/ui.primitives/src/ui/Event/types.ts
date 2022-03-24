import { t } from '../../common';

type Id = string;

export type EventHistory = EventHistoryItem[];
export type EventHistoryItem = {
  id: string;
  timestamp: number;
  event: t.Event;
  count: number;
};

/**
 * A state hook that stores a set of events coming via an event-bus.
 */
export type EventHistoryHookFactory = (
  bus?: t.EventBus<any>,
  options?: EventHistoryOptions,
) => EventHistoryHook;

export type EventHistoryHook = {
  bus: Id;
  total: number;
  events: EventHistory;
};

export type EventHistoryOptions = {
  reset$?: t.Observable<any>;
  onChange?: (e: EventHistory) => void;
  filter?: <E extends t.Event = t.Event>(e: E) => boolean;
};
