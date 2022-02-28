import { Disposable, EventBus } from '@platform/types';
import { Observable } from 'rxjs';
import * as t from '../../common/types';

type InstanceId = string;
type Index = number;

export type EventListAlign = 'auto' | 'smart' | 'center' | 'end' | 'start';

/**
 * EVENTS (API)
 */
export type EventListEventsFactory = (args: {
  bus: EventBus<any>;
  instance: InstanceId;
}) => EventListEvents;

export type EventListEvents = Disposable & {
  $: Observable<EventListEvent>;
  instance: InstanceId;
  scroll: {
    $: Observable<EventListScroll>;
    fire(target: EventListScroll['target'], options?: { align?: EventListAlign }): void;
  };
  click: {
    $: Observable<EventListClicked>;
    fire(args: { index: Index; item: t.EventHistoryItem }): void;
  };
};

/**
 * Events Definitions
 */
export type EventListEvent = EventListScrollEvent | EventListClickedEvent;

/**
 * Initiates a scroll operation on the list.
 */
export type EventListScrollEvent = {
  type: 'sys.ui.EventList/Scroll';
  payload: EventListScroll;
};
export type EventListScroll = {
  instance: InstanceId;
  target: 'Top' | 'Bottom' | Index;
  align?: EventListAlign;
};

/**
 * Fires when an event is clicked.
 */
export type EventListClickedEvent = {
  type: 'sys.ui.EventList/Clicked';
  payload: EventListClicked;
};
export type EventListClicked = {
  instance: InstanceId;
  index: Index;
  item: t.EventHistoryItem;
};
